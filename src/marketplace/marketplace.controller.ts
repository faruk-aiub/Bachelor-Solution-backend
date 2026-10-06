import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Marketplace')
@Controller('api/v1/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @ApiOperation({ summary: 'Search items' })
  @UseInterceptors(CacheInterceptor)
  @Get()
  searchItems(
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.marketplaceService.searchListings(
      category,
      location,
      pageNum,
      limitNum,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my listings' })
  @Get('my-listings')
  getMyListings(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.marketplaceService.getMyListings(
      req.user.userId,
      pageNum,
      limitNum,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create listing' })
  @Post()
  createListing(@Request() req: any, @Body() data: any) {
    return this.marketplaceService.createListing(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark as sold' })
  @Patch(':id/sold')
  markAsSold(@Request() req: any, @Param('id') listingId: string) {
    return this.marketplaceService.markAsSold(listingId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update listing details' })
  @Patch(':id')
  updateListing(
    @Request() req: any,
    @Param('id') listingId: string,
    @Body() data: any,
  ) {
    return this.marketplaceService.updateListing(
      listingId,
      req.user.userId,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete listing' })
  @Delete(':id')
  deleteListing(@Request() req: any, @Param('id') listingId: string) {
    return this.marketplaceService.deleteListing(listingId, req.user.userId);
  }

  @ApiOperation({ summary: 'Get listing by id' })
  @Get(':id')
  getListingById(@Param('id') id: string) {
    return this.marketplaceService.getListingById(id);
  }
}
