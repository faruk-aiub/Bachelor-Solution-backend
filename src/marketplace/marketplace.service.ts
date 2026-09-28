import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async createListing(sellerId: string, data: any) {
    return this.prisma.marketplaceListing.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location
      }
    });
  }

  async searchListings(category?: string, location?: string) {
    return this.prisma.marketplaceListing.findMany({
      where: {
        isSold: false,
        category: category ? { equals: category, mode: 'insensitive' } : undefined,
        location: location ? { contains: location, mode: 'insensitive' } : undefined,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyListings(userId: string) {
    return this.prisma.marketplaceListing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsSold(listingId: string, sellerId: string) {
    return this.prisma.marketplaceListing.updateMany({
      where: { id: listingId, sellerId },
      data: { isSold: true }
    });
  }

  async updateListing(listingId: string, sellerId: string, data: any) {
    return this.prisma.marketplaceListing.updateMany({
      where: { id: listingId, sellerId },
      data
    });
  }

  async deleteListing(listingId: string, sellerId: string) {
    return this.prisma.marketplaceListing.deleteMany({
      where: { id: listingId, sellerId }
    });
  }

  async getListingById(id: string) {
    return this.prisma.marketplaceListing.findUnique({
      where: { id },
      include: { seller: { select: { name: true, phone: true } } }
    });
  }
}
