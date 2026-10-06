import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Marketplace Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let listingId: string;
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
      name: 'Marketplace Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    if (listingId) {
      await prisma.marketplaceListing.deleteMany({ where: { id: listingId } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/marketplace (POST) - Should create a marketplace listing', () => {
    return request(app.getHttpServer())
      .post('/api/v1/marketplace')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Used Chair',
        description: 'A good condition wooden chair',
        price: 1500,
        category: 'Furniture',
        condition: 'Used',
        location: 'Dhaka',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.title).toBe('Used Chair');
        expect(response.body.price).toBe(1500);
        listingId = response.body.id;
      });
  });

  it('/api/v1/marketplace (GET) - Should get all listings', () => {
    return request(app.getHttpServer())
      .get('/api/v1/marketplace')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/api/v1/marketplace/:id/sold (PATCH) - Should mark listing as sold', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/marketplace/${listingId}/sold`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body.count).toBe(1);
      });
  });

  it('/api/v1/marketplace/:id (DELETE) - Should delete the listing', () => {
    return request(app.getHttpServer())
      .delete(`/api/v1/marketplace/${listingId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        // Reset listingId so cleanup doesn't fail
        listingId = '';
      });
  });
});
