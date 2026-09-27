import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getProviderReviews(providerId?: string) {
    return this.prisma.review.findMany({
      where: { providerId: providerId ? providerId : undefined },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, profilePhoto: true } } }
    });
  }

  async addReview(providerId: string, authorId: string, rating: number, comment: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.review.create({
      data: {
        providerId,
        authorId,
        rating,
        comment
      }
    });
  }

  async getReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: { author: { select: { name: true, profilePhoto: true } } }
    });
  }
}
