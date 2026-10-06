import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Services Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let providerId: string;
  let serviceId: string;

  const testPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testPhone,
      password: testPassword,
      name: 'Service Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;

    // Register as provider
    const providerRes = await request(app.getHttpServer())
      .post('/api/v1/providers/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ businessName: 'Service Testing Provider' });
    providerId = providerRes.body.id;
  });

  afterAll(async () => {
    if (serviceId) {
      await prisma.service.deleteMany({ where: { id: serviceId } });
    }
    await prisma.provider.deleteMany({ where: { id: providerId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/services (POST) - Should create a service', async () => {
    // Elevate user to PROVIDER
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });
    const providerToken = loginRes.body.access_token;

    return request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        category: 'HOME_SERVICE',
        title: 'House Cleaning',
        description: 'Deep cleaning service',
        basePrice: 1000,
      })
      .expect(201)
      .then((response) => {
        serviceId = response.body.id;
        expect(response.body.title).toBe('House Cleaning');
      });
  });

  it('/api/v1/services (GET) - Should return list of services', () => {
    return request(app.getHttpServer())
      .get('/api/v1/services')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });
});
