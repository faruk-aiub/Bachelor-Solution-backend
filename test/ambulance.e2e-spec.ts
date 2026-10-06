import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Ambulance Module (e2e)', () => {
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

  it('/api/v1/ambulance/nearby (GET) - Should return array', () => {
    return request(app.getHttpServer())
      .get('/api/v1/ambulance/nearby?lat=23.8&lng=90.4')
      .expect(200)
      .then((response) => {
        // Depending on service, might be response.body or response.body.data
        expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
      });
  });
});
