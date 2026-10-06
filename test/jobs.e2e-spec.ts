import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Jobs Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let createdJobId: string;

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
      name: 'Job Tester',
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: testPhone, password: testPassword });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    if (createdJobId) {
      await prisma.jobPosting.deleteMany({ where: { id: createdJobId } });
    }
    await prisma.user.deleteMany({ where: { phone: testPhone } });
    await app.close();
  });

  it('/api/v1/jobs (POST) - Should create a job posting', () => {
    return request(app.getHttpServer())
      .post('/api/v1/jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Software Engineer',
        company: 'Test Company LLC',
        location: 'Remote',
        requirements: 'Node.js, React',
        type: 'FULL_TIME',
        salary: '50000 BDT',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201)
      .then((response) => {
        expect(response.body.title).toBe('Test Software Engineer');
        createdJobId = response.body.id;
      });
  });

  it('/api/v1/jobs (GET) - Should return list of jobs', () => {
    return request(app.getHttpServer())
      .get('/api/v1/jobs')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
  });

  it('/api/v1/jobs/my-jobs (GET) - Should return my posted jobs', () => {
    return request(app.getHttpServer())
      .get('/api/v1/jobs/my-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
        const hasCreatedJob = response.body.data.some((job: any) => job.id === createdJobId);
        expect(hasCreatedJob).toBe(true);
      });
  });
});
