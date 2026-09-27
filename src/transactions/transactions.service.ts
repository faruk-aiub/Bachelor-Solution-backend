import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async initiatePayment(userId: string, amount: number, purpose: string, gateway?: string) {
    // Generate a mock transaction ID for the initiation
    const trxId = 'TRX-' + Date.now() + '-' + Math.round(Math.random() * 1000);
    
    return this.prisma.transaction.create({
      data: {
        userId,
        amount,
        purpose,
        paymentGateway: gateway || 'AMARPAY',
        trxId,
        status: PaymentStatus.PENDING
      }
    });
  }

  async updatePaymentStatus(trxId: string, status: PaymentStatus) {
    return this.prisma.transaction.update({
      where: { trxId },
      data: { status }
    });
  }
}
