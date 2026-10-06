import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Users Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

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
      name: 'User Profile Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/users/me (GET) - Should get own profile', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body.phone).toBe(testPhone);
        expect(response.body.name).toBe('User Profile Tester');
      });
  });

  it('/api/v1/users/me (PATCH) - Should update own profile', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
        occupation: 'Software Engineer',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.name).toBe('Updated Name');
        expect(response.body.occupation).toBe('Software Engineer');
      });
  });

  it('/api/v1/users (GET) - Admin should get all users', async () => {
    // Elevate user to ADMIN for this test
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    return request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
  });
});
