import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(customerId: string, serviceId: string, totalAmount: number, lat?: number, lng?: number, address?: string) {
    return this.prisma.booking.create({
      data: {
        customerId,
        serviceId,
        totalAmount,
        lat,
        lng,
        address,
        status: BookingStatus.PENDING
      },
      include: {
        service: true,
        customer: { select: { id: true, name: true, phone: true } }
      }
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status }
    });
  }

  async getCustomerBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: { service: true }
    });
  }

  async getProviderBookings(providerId: string) {
    return this.prisma.booking.findMany({
      where: { service: { providerId } },
      include: { customer: true }
    });
  }

  async getBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { service: true, customer: { select: { id: true, name: true, phone: true } } }
    });
  }
}
