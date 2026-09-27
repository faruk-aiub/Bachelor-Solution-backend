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
}
