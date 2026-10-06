import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Providers Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let providerId: string;

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
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testPhone,
      password: testPassword,
      name: 'Provider Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.provider.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/providers/register (POST) - Should register as provider', () => {
    return request(app.getHttpServer())
      .post('/api/v1/providers/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        businessName: 'Test Plumber Services',
        description: 'Best plumbing in town',
        address: '123 Main St, Dhaka',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.businessName).toBe('Test Plumber Services');
        expect(response.body.userId).toBe(userId);
        providerId = response.body.id;
      });
  });

  it('/api/v1/providers (GET) - Should get all providers', () => {
    return request(app.getHttpServer())
      .get('/api/v1/providers')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });

  it('/api/v1/providers/:id (GET) - Should get provider profile', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/providers/${providerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body.businessName).toBe('Test Plumber Services');
      });
  });
});
