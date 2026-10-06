import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { PlumberService } from './plumber.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Plumber')
@Controller('api/v1/plumber')
export class PlumberController {
  constructor(private readonly plumberService: PlumberService) {}

  @ApiOperation({ summary: 'Get available plumbers' })
  @Get('available')
  getAvailablePlumbers(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.plumberService.getAvailablePlumbers(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
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
      problemDetails,
    );
  }

  @ApiOperation({ summary: 'Get specific plumber details' })
  @Get(':id')
  getPlumberById(@Param('id') id: string) {
    return this.plumberService.getPlumberById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my plumber bookings' })
  @Get('my-bookings/all')
  getMyPlumberBookings(@Request() req: any) {
    return this.plumberService.getMyPlumberBookings(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get jobs for provider' })
  @Get('provider/jobs')
  getProviderPlumberJobs(@Request() req: any) {
    return this.plumberService.getProviderPlumberJobs(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update job status (Provider)' })
  @Patch('provider/jobs/:id/status')
  updateJobStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return this.plumberService.updateJobStatus(id, status, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle availability (Provider)' })
  @Patch('provider/availability')
  toggleAvailability(@Request() req: any, @Body('isActive') isActive: boolean) {
    return this.plumberService.toggleAvailability(req.user.userId, isActive);
  }
}
