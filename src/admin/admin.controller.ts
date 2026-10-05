import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Get all users (Admin)' })
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get all providers (Admin)' })
  @Get('providers')
  getAllProviders() {
    return this.adminService.getAllProviders();
  }

  @ApiOperation({ summary: 'Get all support tickets (Admin)' })
  @Get('support-tickets')
  getAllSupportTickets() {
    return this.adminService.getAllSupportTickets();
  }

  @ApiOperation({ summary: 'Delete a housing listing (Moderation)' })
  @Delete('housing/:id')
  deleteHousingListing(@Param('id') id: string) {
    return this.adminService.deleteHousingListing(id);
  }

  @ApiOperation({ summary: 'Delete a marketplace listing (Moderation)' })
  @Delete('marketplace/:id')
  deleteMarketplaceListing(@Param('id') id: string) {
    return this.adminService.deleteMarketplaceListing(id);
  }

  @ApiOperation({ summary: 'Delete a job posting (Moderation)' })
  @Delete('jobs/:id')
  deleteJobPosting(@Param('id') id: string) {
    return this.adminService.deleteJobPosting(id);
  }

  @ApiOperation({ summary: 'Delete a review (Moderation)' })
  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @ApiOperation({ summary: 'Refund a transaction' })
  @Patch('transactions/:id/refund')
  refundTransaction(@Param('id') id: string) {
    return this.adminService.refundTransaction(id);
  }

  @ApiOperation({ summary: 'Update user role (Admin)' })
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string
  ) {
    // Assuming role comes as a valid string value for the Role enum
    return this.adminService.updateUserRole(id, role as any);
  }

  @ApiOperation({ summary: 'Get all transactions (Admin)' })
  @Get('transactions')
  getAllTransactions() {
    return this.adminService.getAllTransactions();
  }

  @ApiOperation({ summary: 'Update support ticket status (Admin)' })
  @Patch('support-tickets/:id/status')
  updateSupportTicketStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.adminService.updateSupportTicketStatus(id, status);
  }

  @ApiOperation({ summary: 'Update transaction status manually (Admin)' })
  @Patch('transactions/:id/status')
  updateTransactionStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.adminService.updateTransactionStatus(id, status as any);
  }

  @ApiOperation({ summary: 'Delete a generic service (Moderation)' })
  @Delete('services/:id')
  deleteService(@Param('id') id: string) {
    return this.adminService.deleteService(id);
  }

  @ApiOperation({ summary: 'Update a booking status manually (Admin)' })
  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.adminService.updateBookingStatus(id, status as any);
  }

  @ApiOperation({ summary: 'Update a supershop order status manually (Admin)' })
  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.adminService.updateOrderStatus(id, status as any);
  }

  @ApiOperation({ summary: 'Get all supershop orders' })
  @Get('orders')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @ApiOperation({ summary: 'Broadcast a notification to all users' })
  @Post('broadcast')
  broadcastNotification(
    @Body('title') title: string,
    @Body('message') message: string
  ) {
    return this.adminService.broadcastNotification(title, message);
  }

  @ApiOperation({ summary: 'Suspend a provider' })
  @Patch('suspend-provider/:id')
  suspendProvider(@Param('id') id: string) {
    return this.adminService.suspendProvider(id);
  }

  @ApiOperation({ summary: 'Delete a mess (Moderation)' })
  @Delete('mess/:id')
  deleteMess(@Param('id') id: string) {
    return this.adminService.deleteMess(id);
  }
}
