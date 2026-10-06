import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private firebaseService: FirebaseService,
  ) {}

  // Helper method to create and push a notification
  async createAndSendNotification(userId: string, title: string, message: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    // Send real-time notification via WebSocket
    this.eventsGateway.sendNotificationToUser(userId, notification);
    
    // Send push notification via FCM if user has a token
    if (user && user.fcmToken) {
      this.firebaseService.sendPushNotification(
        user.fcmToken,
        title,
        message,
        { notificationId: notification.id }
      ).catch(err => console.error("FCM failed:", err));
    }
    
    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async clearNotifications(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
