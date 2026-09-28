import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HousingService {
  constructor(private prisma: PrismaService) {}

  async createListing(ownerId: string, data: any) {
    return this.prisma.housingListing.create({
      data: { ownerId, ...data }
    });
  }

  async searchHousing(type?: string, location?: string, maxRent?: number) {
    return this.prisma.housingListing.findMany({
      where: {
        isAvailable: true,
        type: type ? { equals: type, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
        rentAmount: maxRent ? { lte: maxRent } : undefined
      },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { name: true, phone: true } } }
    });
  }

  async getMyListings(userId: string) {
    return this.prisma.housingListing.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateAvailability(listingId: string, ownerId: string, isAvailable: boolean) {
    return this.prisma.housingListing.updateMany({
      where: { id: listingId, ownerId },
      data: { isAvailable }
    });
  }

  async updateListing(listingId: string, ownerId: string, data: any) {
    return this.prisma.housingListing.updateMany({
      where: { id: listingId, ownerId },
      data
    });
  }

  async deleteListing(listingId: string, ownerId: string) {
    return this.prisma.housingListing.deleteMany({
      where: { id: listingId, ownerId }
    });
  }

  async getHousingById(id: string) {
    return this.prisma.housingListing.findUnique({
      where: { id },
      include: { owner: { select: { name: true, phone: true } } }
    });
  }
}
