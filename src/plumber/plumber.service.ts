import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlumberService {
  constructor(private prisma: PrismaService) {}

  async getAvailablePlumbers(lat?: number, lng?: number) {
    return this.prisma.service.findMany({
      where: {
        category: 'PLUMBER',
        isActive: true
      },
      include: { provider: { select: { businessName: true, address: true, lat: true, lng: true } } }
    });
  }

  async bookPlumber(customerId: string, serviceId: string, address: string, problemDetails: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service) throw new NotFoundException('Plumber service not found');

    return this.prisma.booking.create({
      data: {
        customerId,
        serviceId,
        totalAmount: service.basePrice || 0,
        address,
        problemDetails,
        status: 'PENDING'
      }
    });
  }
}
