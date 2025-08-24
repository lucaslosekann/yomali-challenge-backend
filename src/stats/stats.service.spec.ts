import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { DatabaseModule } from '../database/database.module';

describe('StatsService', () => {
    let service: StatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StatsService],
            imports: [DatabaseModule],
        }).compile();

        service = module.get<StatsService>(StatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get stats', async () => {
        await service.getStats({ dateRange: '7d' });
    });

    it('should get stats for custom range', async () => {
        const start = new Date();
        start.setDate(start.getDate() - 10);
        const end = new Date();
        await service.getStats({
            dateRange: 'custom',
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        });
    });

    it('should get stats for a specific URL', async () => {
        await service.getStats({ dateRange: '30d', url: 'http://example.com' });
    });
});
