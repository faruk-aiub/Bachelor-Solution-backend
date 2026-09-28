import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Get unverified providers' })
  @Get('unverified-providers')
  getUnverifiedProviders() {
    return this.adminService.getUnverifiedProviders();
  }

  @ApiOperation({ summary: 'Verify provider' })
  @Patch('verify-provider/:id')
  verifyProvider(@Param('id') providerId: string) {
    return this.adminService.verifyProvider(providerId);
  }

  @ApiOperation({ summary: 'Delete user (Admin)' })
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Get all bookings (Admin)' })
  @Get('bookings')
  getAllBookings() {
    return this.adminService.getAllBookings();
  }
}
