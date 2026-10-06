import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Plumber Module (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/plumber/available (GET) - Should return array', () => {
    return request(app.getHttpServer())
      .get('/api/v1/plumber/available')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
      });
  });
});
