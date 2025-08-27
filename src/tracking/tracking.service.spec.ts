import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';

describe('TrackingService', () => {
    let service: TrackingService;
    let sessionId: number;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TrackingService],
            imports: [DatabaseModule],
        }).compile();

        service = module.get<TrackingService>(TrackingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should track visit', async () => {
        const visitData = {
            pageUrl: 'http://example.com',
            visitorId: '123e4567-e89b-12d3-a456-426614174000',
            metadata: {
                referrer: 'http://referrer.com',
            },
        };
        const result = await service.trackVisit(
            visitData,
            '127.0.0.1',
            'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0',
        );
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('visitorId', visitData.visitorId);
        expect(result).toHaveProperty('browser', 'Firefox 139.0');
        expect(result).toHaveProperty('os', expect.stringContaining('Linux'));
        sessionId = result.id;
    });

    it('should handle database errors gracefully', async () => {
        jest.spyOn(service['prisma'].session, 'create').mockRejectedValue(
            new Error('Database error'),
        );
        await expect(
            service.trackVisit(
                {
                    pageUrl: 'http://example.com',
                    visitorId: '123e4567-e89b-12d3-a456-426614174000',
                    metadata: {
                        referrer: 'http://referrer.com',
                    },
                },
                '127.0.0.1',
                'Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0',
            ),
        ).rejects.toThrow('Database error');
    });

    it('should update session and add page view', async () => {
        const visitData = {
            pageUrl: 'http://example.com',
            visitorId: '123e4567-e89b-12d3-a456-426614174000',
            metadata: {
                referrer: 'http://referrer.com',
            },
        };
        const session = await service.updateSessionAndAddPageView(
            sessionId,
            visitData.pageUrl,
        );
        expect(session).toBeInstanceOf(Array); // Because of the transaction
        expect(session[0]).toHaveProperty('id', sessionId);
        expect(session[1]).toHaveProperty('pageUrl', visitData.pageUrl);
    });

    //getActiveSession
    it('should return null for non-existing active session', async () => {
        const session = await service.getActiveSession(
            'non-existing-visitor-id',
        );
        expect(session).toBeNull();
    });

    it('should return an active session if exists', async () => {
        const sesstion = await service.getActiveSession(
            '123e4567-e89b-12d3-a456-426614174000',
        );
        expect(sesstion).toHaveProperty(
            'visitorId',
            '123e4567-e89b-12d3-a456-426614174000',
        );
    });
});
