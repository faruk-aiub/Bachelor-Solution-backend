import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { MaidService } from './maid.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Maid')
@Controller('api/v1/maid')
export class MaidController {
  constructor(private readonly maidService: MaidService) {}

  @ApiOperation({ summary: 'Get available maids' })
  @Get('available')
  getAvailableMaids(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string
  ) {
    return this.maidService.getAvailableMaids(
      lat ? parseFloat(lat) : undefined, 
      lng ? parseFloat(lng) : undefined
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book maid' })
  @Post('book')
  bookMaid(
    @Request() req: any,
    @Body('serviceId') serviceId: string,
    @Body('address') address: string,
    @Body('date') date: string,
    @Body('instructions') instructions?: string,
  ) {
    return this.maidService.bookMaid(
      req.user.userId,
      serviceId,
      address,
      new Date(date),
      instructions
    );
  }

  @ApiOperation({ summary: 'Get specific maid details' })
  @Get(':id')
  getMaidById(@Param('id') id: string) {
    return this.maidService.getMaidById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my maid bookings' })
  @Get('my-bookings/all')
  getMyMaidBookings(@Request() req: any) {
    return this.maidService.getMyMaidBookings(req.user.userId);
  }
}
