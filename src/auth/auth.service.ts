import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: data.phone,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'CUSTOMER'
      }
    });

    return this.generateToken(user);
  }

  async login(phone: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role }
    };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new UnauthorizedException('Incorrect old password');

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { success: true, message: 'Password updated successfully' };
  }

  async verifyOtp(phone: string, otp: string) {
    // In a real app, verify OTP with Redis or Database
    // For now, assume OTP is 1234 or mock successful validation
    if (otp !== '1234') {
      throw new UnauthorizedException('Invalid OTP');
    }
    return { success: true, message: 'OTP verified successfully' };
  }

  async resetPassword(phone: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('User not found');

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { phone },
      data: { password: hashedNewPassword }
    });

    return { success: true, message: 'Password reset successfully' };
  }
}
