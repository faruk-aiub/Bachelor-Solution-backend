import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { HousingService } from './housing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Housing')
@Controller('api/v1/housing')
export class HousingController {
  constructor(private readonly housingService: HousingService) {}

  @ApiOperation({ summary: 'Search housing' })
  @Get()
  searchHousing(
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('maxRent') maxRent?: string,
  ) {
    return this.housingService.searchHousing(type, location, maxRent ? parseFloat(maxRent) : undefined);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my listings' })
  @Get('my-listings')
  getMyListings(@Request() req: any) {
    return this.housingService.getMyListings(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create listing' })
  @Post()
  createListing(
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.housingService.createListing(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark as unavailable' })
  @Patch(':id/availability')
  markAsUnavailable(
    @Request() req: any,
    @Param('id') listingId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.housingService.updateAvailability(listingId, req.user.userId, isAvailable);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete listing' })
  @Delete(':id')
  deleteListing(
    @Request() req: any,
    @Param('id') listingId: string,
  ) {
    return this.housingService.deleteListing(listingId, req.user.userId);
  }

  @ApiOperation({ summary: 'Get housing by id' })
  @Get(':id')
  getHousingById(@Param('id') id: string) {
    return this.housingService.getHousingById(id);
  }
}
