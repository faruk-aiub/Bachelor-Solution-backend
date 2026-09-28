import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true, name: true, 
        gender: true, occupation: true, role: true, profilePhoto: true
      } // excluding password
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, phone: true, email: true, name: true, 
        gender: true, occupation: true, role: true, profilePhoto: true, createdAt: true
      } // excluding password
    });
  }

  async updateUser(userId: string, data: any) {
    // Only allow specific fields to be updated
    const { name, gender, occupation, profilePhoto } = data;
    return this.prisma.user.update({
      where: { id: userId },
      data: { name, gender, occupation, profilePhoto },
      select: {
        id: true, phone: true, email: true, name: true, 
        gender: true, occupation: true, role: true, profilePhoto: true
      }
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId }
    });
  }
}
