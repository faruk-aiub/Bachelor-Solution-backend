import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('api/v1/bookings')
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Create a new booking' })
  @Post()
  createBooking(
    @Request() req: any,
    @Body('serviceId') serviceId: string,
    @Body('totalAmount') totalAmount: number,
    @Body('lat') lat?: number,
    @Body('lng') lng?: number,
    @Body('address') address?: string,
  ) {
    return this.bookingsService.createBooking(req.user.userId, serviceId, totalAmount, lat, lng, address);
  }

  @ApiOperation({ summary: 'Get customer bookings' })
  @Get('customer')
  getCustomerBookings(@Request() req: any) {
    return this.bookingsService.getCustomerBookings(req.user.userId);
  }

  @ApiOperation({ summary: 'Get provider bookings' })
  @Get('provider')
  getProviderBookings(@Request() req: any) {
    // Requires provider ID, simplified here assuming userId is providerId
    return this.bookingsService.getProviderBookings(req.user.userId);
  }

  @ApiOperation({ summary: 'Update status' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') bookingId: string,
    @Body('status') status: any,
  ) {
    return this.bookingsService.updateBookingStatus(bookingId, status);
  }

  @ApiOperation({ summary: 'Get single booking' })
  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  @ApiOperation({ summary: 'Cancel booking' })
  @Delete(':id')
  cancelBooking(
    @Request() req: any,
    @Param('id') id: string
  ) {
    return this.bookingsService.cancelBooking(id, req.user.userId);
  }
}
