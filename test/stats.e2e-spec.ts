import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('StatsController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    it('/stats (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/stats')
            .query({ dateRange: '7d' })
            .expect(200);

        const body = response.body as unknown;

        expect(body).toBeDefined();
    });

    it('/stats (GET) custom range', async () => {
        const start = new Date();
        start.setDate(start.getDate() - 10);
        const end = new Date();
        const response = await request(app.getHttpServer())
            .get('/stats')
            .query({
                dateRange: 'custom',
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            })
            .expect(200);

        const body = response.body as unknown;

        expect(body).toBeDefined();
    });

    it('/stats (GET) for a specific URL', async () => {
        const response = await request(app.getHttpServer())
            .get('/stats')
            .query({ dateRange: '30d', url: 'http://example.com' })
            .expect(200);

        const body = response.body as unknown;

        expect(body).toBeDefined();
    });

    it('/stats (GET) invalid custom range', async () => {
        const response = await request(app.getHttpServer())
            .get('/stats')
            .query({ dateRange: 'custom' })
            .expect(400);

        const body = response.body as {
            message: string[];
        };

        expect(body.message).toStrictEqual([
            'startDate must be a valid ISO 8601 date string',
            'endDate must be a valid ISO 8601 date string',
        ]);
    });
});
