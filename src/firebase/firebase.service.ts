import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    // Initialize Firebase Admin only if we have credentials
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      if (!getApps().length) {
        try {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
          });
          this.logger.log('Firebase Admin initialized successfully');
        } catch (error) {
          this.logger.error('Failed to initialize Firebase Admin', error);
        }
      }
    } else {
      this.logger.warn('Firebase credentials not found. Push notifications will not work.');
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!getApps().length) {
      this.logger.warn('Firebase not initialized. Skipping push notification.');
      return null;
    }

    try {
      const message: Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };

      const response = await getMessaging().send(message);
      this.logger.log(`Successfully sent push notification: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending push notification', error);
      throw error;
    }
  }
}
