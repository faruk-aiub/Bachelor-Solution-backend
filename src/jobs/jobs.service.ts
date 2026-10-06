import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJobPosting(userId: string, data: any) {
    return this.prisma.jobPosting.create({
      data: { ...data, posterId: userId },
    });
  }

  async getAllJobs(type?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where: { type: type ? type : undefined, deadline: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobPosting.count({
        where: { type: type ? type : undefined, deadline: { gte: new Date() } },
      }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async applyForJob(jobId: string, applicantId: string) {
    return this.prisma.jobApplication.create({
      data: { jobId, applicantId, status: 'PENDING' },
    });
  }

  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { applicantId: userId },
      include: { job: true },
    });
  }

  async getApplicants(jobId: string) {
    return this.prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: { name: true, phone: true, email: true, profilePhoto: true },
        },
      },
    });
  }

  async updateApplicationStatus(applicationId: string, status: string) {
    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async withdrawApplication(applicationId: string, applicantId: string) {
    return this.prisma.jobApplication.deleteMany({
      where: { id: applicationId, applicantId },
    });
  }

  async getJobById(id: string) {
    return this.prisma.jobPosting.findUnique({
      where: { id },
      include: { poster: { select: { name: true, profilePhoto: true } } },
    });
  }

  async getMyPostedJobs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where: { posterId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobPosting.count({ where: { posterId: userId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateJobPosting(userId: string, jobId: string, data: any) {
    return this.prisma.jobPosting.updateMany({
      where: { id: jobId, posterId: userId },
      data,
    });
  }

  async deleteJobPosting(userId: string, jobId: string) {
    return this.prisma.jobPosting.deleteMany({
      where: { id: jobId, posterId: userId },
    });
  }
}
