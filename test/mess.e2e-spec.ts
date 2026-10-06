import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Mess Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let messId: string;

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
      name: 'Mess Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: 'Password123!' });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    if (messId) {
      await prisma.messMember.deleteMany({ where: { messId } });
      await prisma.mess.deleteMany({ where: { id: messId } });
    }
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('/api/v1/mess/create (POST) - Should create a mess and become manager', () => {
    return request(app.getHttpServer())
      .post('/api/v1/mess/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Bachelor Boys Mess',
        address: 'Uttara, Dhaka',
      })
      .expect(201)
      .then((response) => {
        messId = response.body.id;
        expect(response.body.name).toBe('Bachelor Boys Mess');
      });
  });

  it('/api/v1/mess/my-mess (GET) - Should return user mess details', () => {
    return request(app.getHttpServer())
      .get('/api/v1/mess/my-mess')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(response.body.mess.name).toBe('Bachelor Boys Mess');
        expect(response.body.isManager).toBe(true);
      });
  });
});
