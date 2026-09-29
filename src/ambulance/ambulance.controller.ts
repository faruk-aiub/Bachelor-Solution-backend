import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AmbulanceService } from './ambulance.service';

@ApiTags('Ambulance')
@Controller('api/v1/ambulance')
export class AmbulanceController {
  constructor(private readonly ambulanceService: AmbulanceService) {}

  @Get('nearby')
  async getNearbyAmbulances(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string = '5',
  ) {
    return this.ambulanceService.findNearbyAmbulances(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
  }

  @Post('request')
  async requestAmbulance(
    @Body('customerId') customerId: string,
    @Body('serviceId') serviceId: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @Body('address') address: string,
  ) {
    return this.ambulanceService.requestEmergencyAmbulance(
      customerId,
      serviceId,
      lat,
      lng,
      address
    );
  }

  @ApiOperation({ summary: 'Get specific ambulance details' })
  @Get(':id')
  async getAmbulanceById(@Param('id') id: string) {
    return this.ambulanceService.getAmbulanceById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my ambulance requests' })
  @Get('my-requests/all')
  async getMyAmbulanceRequests(@Request() req: any) {
    return this.ambulanceService.getMyAmbulanceRequests(req.user.userId);
  }
}
