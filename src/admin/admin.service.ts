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

  async getUnverifiedProviders() {
    return this.prisma.provider.findMany({
      where: { isVerified: false },
      include: { user: { select: { name: true, phone: true, email: true } } }
    });
  }

  async verifyProvider(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isVerified: true }
    });
  }

  async deleteUser(userId: string) {
    // Delete user will cascade and delete associated data
    return this.prisma.user.delete({
      where: { id: userId }
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true } },
        service: { 
          select: { 
            provider: { 
              select: { 
                businessName: true, 
                user: { select: { phone: true } } 
              } 
            } 
          } 
        }
      }
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async getAllProviders() {
    return this.prisma.provider.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true, email: true } }
      }
    });
  }

  async getAllSupportTickets() {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true, email: true } }
      }
    });
  }
}
