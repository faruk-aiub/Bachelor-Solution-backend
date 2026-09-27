import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PlumberService } from './plumber.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Plumber')
@Controller('api/v1/plumber')
export class PlumberController {
  constructor(private readonly plumberService: PlumberService) {}

  @ApiOperation({ summary: 'Get available plumbers' })
  @Get('available')
  getAvailablePlumbers(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string
  ) {
    return this.plumberService.getAvailablePlumbers(
      lat ? parseFloat(lat) : undefined, 
      lng ? parseFloat(lng) : undefined
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book plumber' })
  @Post('book')
  bookPlumber(
    @Request() req: any,
    @Body('serviceId') serviceId: string,
    @Body('address') address: string,
    @Body('problemDetails') problemDetails: string,
  ) {
    return this.plumberService.bookPlumber(
      req.user.userId,
      serviceId,
      address,
      problemDetails
    );
  }
}
