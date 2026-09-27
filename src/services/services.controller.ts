import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Services')
@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: 'Search services' })
  @Get()
  searchServices(
    @Query('category') category?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.servicesService.searchServices(category, lat, lng);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add service' })
  @Post()
  addService(
    @Request() req: any,
    @Body() data: any,
  ) {
    if (req.user.role !== 'PROVIDER') throw new UnauthorizedException();
    return this.servicesService.addService(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update service' })
  @Patch(':id')
  updateService(
    @Request() req: any,
    @Param('id') serviceId: string,
    @Body() data: any, // { basePrice, isActive, description }
  ) {
    if (req.user.role !== 'PROVIDER') throw new UnauthorizedException();
    return this.servicesService.updateService(req.user.userId, serviceId, data);
  }

  @ApiOperation({ summary: 'Get single service' })
  @Get(':id')
  getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }
}
