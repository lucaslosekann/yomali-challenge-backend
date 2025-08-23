import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('TrackingController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/tracking (POST)', async () => {
    const payload = {
      pageUrl: 'http://example.com',
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
    };
    const response = await request(app.getHttpServer())
      .post('/tracking')
      .send(payload)
      .expect(201);

    const body = response.body as {
      pageUrl: string;
      visitorId: string;
    };

    expect(body.pageUrl).toBe(payload.pageUrl);
    expect(body.visitorId).toBe(payload.visitorId);
  });

  it('/tracking (POST) invalid pageUrl', async () => {
    const payload = {
      pageUrl: 'example',
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
    };
    const response = await request(app.getHttpServer())
      .post('/tracking')
      .send(payload)
      .expect(400);

    const body = response.body as {
      message: string[];
    };

    expect(body.message).toStrictEqual(['pageUrl must be a URL address']);
  });

  it('/tracking (POST) invalid visitorId', async () => {
    const payload = {
      pageUrl: 'http://example.com',
      visitorId: '123e4567-e89b-12d356-426614174000',
    };
    const response = await request(app.getHttpServer())
      .post('/tracking')
      .send(payload)
      .expect(400);

    const body = response.body as {
      message: string[];
    };

    expect(body.message).toStrictEqual(['visitorId must be a UUID']);
  });
});
