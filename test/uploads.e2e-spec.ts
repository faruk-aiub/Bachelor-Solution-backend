import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Uploads Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;

  const testPhone = `017${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const testPassword = 'Password123!';

  // Tiny 1x1 valid GIF image buffer
  const imageBuffer = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64',
  );

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
      name: 'Upload Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { phone: testPhone } });
    await app.close();
  });

  it('/api/v1/uploads (POST) - Should fail if no file is provided', () => {
    return request(app.getHttpServer())
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe('File is required');
      });
  });

  it('/api/v1/uploads (POST) - Should upload image to Cloudinary and return url', () => {
    return request(app.getHttpServer())
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', imageBuffer, {
        filename: 'test-image.gif',
        contentType: 'image/gif',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.url).toBeDefined();
        // The URL should point to Cloudinary
        expect(response.body.url).toContain('res.cloudinary.com');
      });
  }, 15000); // Allow 15 seconds for Cloudinary upload
});
