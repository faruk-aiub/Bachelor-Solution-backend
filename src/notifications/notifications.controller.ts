import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get notifications' })
  @Get()
  getNotifications(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @ApiOperation({ summary: 'Mark as read' })
  @Post(':id/read')
  markAsRead(@Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  @ApiOperation({ summary: 'Mark all as read' })
  @Patch('mark-all-read')
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @ApiOperation({ summary: 'Clear all notifications' })
  @Delete('clear')
  clearNotifications(@Request() req: any) {
    return this.notificationsService.clearNotifications(req.user.userId);
  }

  @ApiOperation({ summary: 'Delete a single notification' })
  @Delete(':id')
  deleteNotification(
    @Request() req: any,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId, req.user.userId);
  }
}
