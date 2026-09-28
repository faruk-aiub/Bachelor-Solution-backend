import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Providers')
@Controller('api/v1/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @ApiOperation({ summary: 'Get all providers' })
  @Get()
  getAllProviders() {
    return this.providersService.getAllProviders();
  }

  @ApiOperation({ summary: 'Get provider profile' })
  @Get(':id')
  getProviderProfile(@Param('id') id: string) {
    return this.providersService.getProviderProfile(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register provider' })
  @Post('register')
  registerProvider(
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.providersService.createProvider(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update provider profile' })
  @Patch('me')
  updateProviderProfile(
    @Request() req: any,
    @Body() data: any, // { businessName, description, address, lat, lng }
  ) {
    return this.providersService.updateProvider(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unregister as provider' })
  @Delete('me')
  deleteProvider(@Request() req: any) {
    return this.providersService.deleteProvider(req.user.userId);
  }
}
