import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Support Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let ticketId: string;

  const testPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testPhone,
      password: 'Password123!',
      name: 'Support Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: 'Password123!' });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    if (ticketId) {
      await prisma.supportTicket.deleteMany({ where: { id: ticketId } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/support (POST) - Should create a support ticket', () => {
    return request(app.getHttpServer())
      .post('/api/v1/support')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        subject: 'App Crashing',
        description: 'The app crashes when I open the marketplace',
      })
      .expect(201)
      .then((response) => {
        ticketId = response.body.id;
        expect(response.body.subject).toBe('App Crashing');
      });
  });

  it('/api/v1/support (GET) - Should return user tickets', () => {
    return request(app.getHttpServer())
      .get('/api/v1/support')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });
});
