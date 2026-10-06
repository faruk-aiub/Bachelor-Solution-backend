import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Housing Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let listingId: string;

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
      name: 'Housing Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: 'Password123!' });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    if (listingId) {
      await prisma.housingListing.deleteMany({ where: { id: listingId } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/housing (POST) - Should create listing', () => {
    return request(app.getHttpServer())
      .post('/api/v1/housing')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Bachelor Seat Available',
        description: 'Nice room',
        type: 'Bachelor Seat',
        gender: 'Male',
        rentAmount: 3000,
        location: 'Mirpur',
      })
      .expect(201)
      .then((response) => {
        listingId = response.body.id;
        expect(response.body.title).toBe('Bachelor Seat Available');
      });
  });

  it('/api/v1/housing (GET) - Should get all housing listings', () => {
    return request(app.getHttpServer())
      .get('/api/v1/housing')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
      });
  });
});
