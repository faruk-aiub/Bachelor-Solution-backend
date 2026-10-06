import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  // Run every midnight to clean up expired jobs
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredJobs() {
    this.logger.log('Running daily cron job to remove expired job postings...');

    try {
      // Find jobs where the deadline has passed
      const result = await this.prisma.jobPosting.deleteMany({
        where: {
          deadline: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(
        `Successfully removed ${result.count} expired job postings.`,
      );
    } catch (error) {
      this.logger.error('Error removing expired jobs', error);
    }
  }

  // Run every hour to automatically cancel pending bookings that are older than 24 hours
  @Cron(CronExpression.EVERY_HOUR)
  async handleStaleBookings() {
    this.logger.log(
      'Running hourly cron job to cancel stale pending bookings...',
    );

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Automatically cancelled ${result.count} stale bookings.`,
        );
      }
    } catch (error) {
      this.logger.error('Error cancelling stale bookings', error);
    }
  }
}
