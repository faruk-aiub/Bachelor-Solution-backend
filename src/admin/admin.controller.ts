import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin')
@Controller('api/v1/admin')
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
// In a real app, you would add a @Roles('ADMIN') guard here
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get dashboard stats' })
  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Verify provider' })
  @Patch('verify-provider/:id')
  verifyProvider(@Param('id') providerId: string) {
    return this.adminService.verifyProvider(providerId);
  }
}
