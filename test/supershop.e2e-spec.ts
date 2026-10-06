import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Supershop Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let shopId: string;
  let productId: string;

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
      name: 'Shop Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' },
    });

    const newLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });
    accessToken = newLoginRes.body.access_token;

    await request(app.getHttpServer())
      .post('/api/v1/providers/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ businessName: 'Super Provider' });
  });

  afterAll(async () => {
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    if (shopId) {
      await prisma.supershop.deleteMany({ where: { id: shopId } });
    }
    await prisma.provider.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/supershop/register (POST) - Should register a shop', () => {
    return request(app.getHttpServer())
      .post('/api/v1/supershop/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        shopName: 'My Grocery Shop',
        address: 'Uttara',
      })
      .expect(201)
      .then((response) => {
        shopId = response.body.id;
        expect(response.body.shopName).toBe('My Grocery Shop');
      });
  });

  it('/api/v1/supershop/products (POST) - Should add a product', () => {
    return request(app.getHttpServer())
      .post('/api/v1/supershop/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Apple',
        price: 150,
        stock: 100,
        category: 'Fruits',
      })
      .expect(201)
      .then((response) => {
        productId = response.body.id;
        expect(response.body.name).toBe('Apple');
      });
  });

  it('/api/v1/supershop/nearby (GET) - Should get nearby shops', () => {
    return request(app.getHttpServer())
      .get('/api/v1/supershop/nearby')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
      });
  });
});
