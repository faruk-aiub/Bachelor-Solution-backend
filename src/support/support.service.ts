import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, subject: string, description: string) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        description
      }
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Usually used by Admin
  async resolveTicket(ticketId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED' }
    });
  }

  async getTicketById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id }
    });
  }
}
