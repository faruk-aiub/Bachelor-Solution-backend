import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Notifications Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let notificationId: string;

  const testPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a user and get token
    const regRes = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testPhone,
      password: testPassword,
      name: 'Notification Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;

    // Create a mock notification in the DB to test fetching and marking as read
    const notif = await prisma.notification.create({
      data: {
        userId,
        title: 'Test Notification',
        message: 'This is a test notification',
      },
    });
    notificationId = notif.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/notifications (GET) - Should return notifications', () => {
    return request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].title).toBe('Test Notification');
        expect(response.body[0].isRead).toBe(false);
      });
  });

  it('/api/v1/notifications/:id/read (POST) - Should mark as read', () => {
    return request(app.getHttpServer())
      .post(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201) // POST request returns 201 by default in NestJS
      .then((response) => {
        expect(response.body.isRead).toBe(true);
      });
  });

  it('/api/v1/notifications/clear (DELETE) - Should clear all notifications', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/notifications/clear')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body.count).toBeDefined();
      });
  });
});
