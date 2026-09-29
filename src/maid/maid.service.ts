import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaidService {
  constructor(private prisma: PrismaService) {}

  async getAvailableMaids(lat?: number, lng?: number) {
    // Basic implementation - returning all active maid services
    // If lat/lng provided, PostGIS ST_Distance logic should be used here like in Ambulance
    return this.prisma.service.findMany({
      where: {
        category: 'MAID',
        isActive: true
      },
      include: { provider: { select: { businessName: true, address: true, lat: true, lng: true } } }
    });
  }

  async bookMaid(customerId: string, serviceId: string, address: string, date: Date, instructions?: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service) throw new NotFoundException('Maid service not found');

    return this.prisma.booking.create({
      data: {
        customerId,
        serviceId,
        totalAmount: service.basePrice || 0,
        address,
        problemDetails: `Preferred Date: ${date.toISOString()}. ${instructions || ''}`,
        status: 'PENDING'
      }
    });
  }

  async getMaidById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id, category: 'MAID' },
      include: {
        provider: {
          include: {
            reviews: true,
            user: { select: { name: true, phone: true } }
          }
        }
      }
    });
    if (!service) throw new NotFoundException('Maid service not found');
    return service;
  }

  async getMyMaidBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: {
        customerId,
        service: { category: 'MAID' }
      },
      include: {
        service: { include: { provider: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProviderMaidJobs(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        service: {
          provider: { userId },
          category: 'MAID'
        }
      },
      include: {
        customer: { select: { name: true, phone: true } },
        service: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateJobStatus(bookingId: string, status: any, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: { include: { provider: true } } }
    });
    if (!booking || booking.service.provider.userId !== userId) {
      throw new NotFoundException('Booking not found or unauthorized');
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });
  }

  async toggleAvailability(userId: string, isActive: boolean) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');
    
    const service = await this.prisma.service.findFirst({
      where: { providerId: provider.id, category: 'MAID' }
    });
    if (!service) throw new NotFoundException('Maid service not found for this provider');

    return this.prisma.service.update({
      where: { id: service.id },
      data: { isActive }
    });
  }
}
