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
    
    const successfulTransactions = await this.prisma.transaction.findMany({
      where: { status: 'SUCCESSFUL' }
    });
    const totalRevenue = successfulTransactions.reduce((sum, trx) => sum + trx.amount, 0);

    return {
      totalUsers,
      totalProviders,
      totalBookings,
      totalTransactions,
      totalRevenue
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

  // --- Content Moderation ---
  async deleteHousingListing(id: string) {
    const listing = await this.prisma.housingListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.prisma.housingListing.delete({ where: { id } });
  }

  async deleteMarketplaceListing(id: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.prisma.marketplaceListing.delete({ where: { id } });
  }

  async deleteJobPosting(id: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    // Delete applications first due to constraints
    await this.prisma.jobApplication.deleteMany({ where: { jobId: id } });
    return this.prisma.jobPosting.delete({ where: { id } });
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.delete({ where: { id } });
  }

  // --- Refund Management ---
  async refundTransaction(id: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    
    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'REFUNDED' }
    });
  }
  // --- Additional Admin Features ---
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true } },
        shop: { select: { shopName: true } }
      }
    });
  }

  async broadcastNotification(title: string, message: string) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    if (users.length === 0) return { count: 0 };
    
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message
    }));

    return this.prisma.notification.createMany({
      data: notifications
    });
  }

  async suspendProvider(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isVerified: false }
    });
  }

  async deleteMess(id: string) {
    const mess = await this.prisma.mess.findUnique({ where: { id } });
    if (!mess) throw new NotFoundException('Mess not found');

    // Clean up relations first due to lack of cascade delete in schema
    await this.prisma.meal.deleteMany({ where: { messId: id } });
    await this.prisma.messExpense.deleteMany({ where: { messId: id } });
    await this.prisma.messMember.deleteMany({ where: { messId: id } });
    
    return this.prisma.mess.delete({ where: { id } });
  }
}
