import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
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
}
