import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Generate a random phone number to avoid unique constraint errors during tests
  const testPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up the test user from database after tests finish
    await prisma.user.deleteMany({
      where: { phone: testPhone },
    });
    await app.close();
  });

  it('/api/v1/auth/register (POST) - Should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        phone: testPhone,
        password: testPassword,
        name: 'Test User',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.access_token).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.phone).toBe(testPhone);
      });
  });

  it('/api/v1/auth/login (POST) - Should login and return JWT token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        phone: testPhone,
        password: testPassword,
      })
      .expect(201) // NestJS default for POST is 201 unless overridden
      .then((response) => {
        expect(response.body.access_token).toBeDefined();
      });
  });
});
