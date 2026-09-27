import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async searchServices(category?: string, lat?: string, lng?: string) {
    return this.prisma.service.findMany({
      where: { category: category as any, isActive: true },
      include: { provider: { select: { businessName: true, lat: true, lng: true } } }
    });
  }

  async addService(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    return this.prisma.service.create({
      data: {
        providerId: provider.id,
        category: data.category,
        title: data.title,
        description: data.description,
        basePrice: data.basePrice
      }
    });
  }

  async updateService(userId: string, serviceId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    return this.prisma.service.updateMany({
      where: { id: serviceId, providerId: provider.id },
      data: {
        basePrice: data.basePrice,
        description: data.description,
        isActive: data.isActive
      }
    });
  }

  async getServiceById(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: { provider: { select: { businessName: true, lat: true, lng: true } } }
    });
  }
}
