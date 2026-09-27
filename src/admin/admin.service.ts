import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalProviders = await this.prisma.provider.count();
    const totalBookings = await this.prisma.booking.count();
    const totalTransactions = await this.prisma.transaction.count();
    
    return {
      totalUsers,
      totalProviders,
      totalBookings,
      totalTransactions
    };
  }

  async verifyProvider(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isVerified: true }
    });
  }
}
