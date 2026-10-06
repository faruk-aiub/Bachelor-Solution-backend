import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async getResources(type?: string) {
    return this.prisma.learningResource.findMany({
      where: type ? { type: { equals: type, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Usually an admin/moderator function to upload resources
  async addResource(data: any) {
    return this.prisma.learningResource.create({
      data,
    });
  }

  async getResourceById(id: string) {
    return this.prisma.learningResource.findUnique({
      where: { id },
    });
  }

  async updateResource(id: string, data: any) {
    return this.prisma.learningResource.update({
      where: { id },
      data,
    });
  }

  async deleteResource(id: string) {
    return this.prisma.learningResource.delete({
      where: { id },
    });
  }
}
