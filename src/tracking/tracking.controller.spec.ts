import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';
import { Request } from 'express';
import { randomUUID } from 'crypto';

describe('TrackingController', () => {
    let controller: TrackingController;
    const visitorId = randomUUID();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TrackingController],
            providers: [TrackingService],
            imports: [DatabaseModule],
        }).compile();

        controller = module.get<TrackingController>(TrackingController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call trackVisit on the service', async () => {
        const trackVisitSpy = jest.spyOn(
            controller['trackingService'],
            'trackVisit',
        );
        const visitData = {
            pageUrl: 'http://example.com',
            visitorId: randomUUID(),
            metadata: {
                referrer: 'http://referrer.com',
            },
        };

        await controller.create(visitData, '127.0.0.1', {
            headers: { 'user-agent': 'jest-test' },
        } as Request);

        expect(trackVisitSpy).toHaveBeenCalledWith(
            visitData,
            '127.0.0.1',
            'jest-test',
        );
    });

    it('should create a new session', async () => {
        const visitData = {
            pageUrl: 'http://example.com',
            visitorId,
            metadata: {
                referrer: 'http://referrer.com',
            },
        };
        const result = await controller.create(visitData, '127.0.0.1', {
            headers: { 'user-agent': 'jest-test' },
        } as Request);

        expect(result).toHaveProperty('message', 'New session created');
    });

    it('should continue an existing session', async () => {
        const visitData = {
            pageUrl: 'http://example.com',
            visitorId,
            metadata: {
                referrer: 'http://referrer.com',
            },
        };
        const result = await controller.create(visitData, '127.0.0.1', {
            headers: { 'user-agent': 'jest-test' },
        } as Request);

        expect(result).toHaveProperty(
            'message',
            'Page view added to existing session',
        );
    });
});
