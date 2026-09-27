import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
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
}
