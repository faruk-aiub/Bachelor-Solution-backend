import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Bookings Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customerToken: string;
  let providerToken: string;
  let customerId: string;
  let providerUserId: string;
  let serviceId: string;
  let bookingId: string;

  const testCustomerPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testProviderPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create Customer
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testCustomerPhone,
      password: testPassword,
      name: 'Customer Tester',
    });
    const customerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testCustomerPhone, password: testPassword });
    customerToken = customerLogin.body.access_token;
    customerId = customerLogin.body.user.id;

    // 2. Create Provider User
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      phone: testProviderPhone,
      password: testPassword,
      name: 'Provider Tester',
    });
    const providerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testProviderPhone, password: testPassword });
    providerToken = providerLogin.body.access_token;
    providerUserId = providerLogin.body.user.id;

    // 3. Register as Provider
    const providerRes = await request(app.getHttpServer())
      .post('/api/v1/providers/register')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        businessName: 'Test Plumber Services',
      });

    // 4. Create a Service
    const service = await prisma.service.create({
      data: {
        providerId: providerRes.body.id,
        category: 'PLUMBER',
        title: 'Pipe Fixing',
        basePrice: 500,
      },
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    // Cleanup
    if (bookingId) {
      await prisma.booking.deleteMany({ where: { id: bookingId } });
    }
    await prisma.service.deleteMany({ where: { id: serviceId } });
    await prisma.provider.deleteMany({ where: { userId: providerUserId } });
    await prisma.user.deleteMany({
      where: { id: { in: [customerId, providerUserId] } },
    });
    await app.close();
  });

  it('/api/v1/bookings (POST) - Should create a booking', () => {
    return request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceId,
        totalAmount: 500,
        address: 'Dhaka',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.totalAmount).toBe(500);
        bookingId = response.body.id;
      });
  });

  it('/api/v1/bookings/customer (GET) - Should get customer bookings', () => {
    return request(app.getHttpServer())
      .get('/api/v1/bookings/customer')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/api/v1/bookings/:id/status (PATCH) - Should update booking status as provider', async () => {
    // Elevate provider user to PROVIDER role for the guard
    await prisma.user.update({
      where: { id: providerUserId },
      data: { role: 'PROVIDER' },
    });

    // We must re-login to get the updated role in the token
    const providerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testProviderPhone, password: testPassword });
    const updatedProviderToken = providerLogin.body.access_token;

    return request(app.getHttpServer())
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${updatedProviderToken}`)
      .send({ status: 'ACCEPTED' })
      .expect(200)
      .then((response) => {
        expect(response.body.status).toBe('ACCEPTED');
      });
  });
});
