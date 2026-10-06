import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async getAllProviders() {
    return this.prisma.provider.findMany({ where: { isVerified: true } });
  }

  async getProviderProfile(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: { services: true, reviews: true },
    });
  }

  async createProvider(userId: string, data: any) {
    const existing = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (existing) throw new ConflictException('Already a provider.');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' },
    });

    return this.prisma.provider.create({
      data: {
        userId,
        businessName: data.businessName,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  async updateProvider(userId: string, data: any) {
    const existing = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Provider profile not found');

    return this.prisma.provider.update({
      where: { userId },
      data: {
        businessName: data.businessName,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  async deleteProvider(userId: string) {
    const existing = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Provider profile not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'CUSTOMER' },
    });

    return this.prisma.provider.delete({
      where: { userId },
    });
  }
}
