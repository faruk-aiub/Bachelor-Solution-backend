import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Reviews Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let providerId: string;
  let reviewId: string;

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
      name: 'Review Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: 'Password123!' });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;

    const providerUser = await prisma.user.create({
      data: {
        phone: `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        password: 'pass',
        role: 'PROVIDER',
      },
    });

    const provider = await prisma.provider.create({
      data: {
        userId: providerUser.id,
        businessName: 'Review Provider',
      },
    });
    providerId = provider.id;
  });

  afterAll(async () => {
    if (reviewId) {
      await prisma.review.deleteMany({ where: { id: reviewId } });
    }
    const provider = await prisma.provider.findUnique({ where: { id: providerId }});
    if (provider) {
      await prisma.provider.deleteMany({ where: { id: providerId } });
      await prisma.user.deleteMany({ where: { id: provider.userId } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/reviews (POST) - Should create a review', () => {
    return request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        providerId,
        rating: 5,
        comment: 'Great service!',
      })
      .expect(201)
      .then((response) => {
        reviewId = response.body.id;
        expect(response.body.rating).toBe(5);
        expect(response.body.comment).toBe('Great service!');
      });
  });

  it('/api/v1/reviews?providerId=:id (GET) - Should return provider reviews', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/reviews?providerId=${providerId}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });
});
