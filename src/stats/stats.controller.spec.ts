import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { DatabaseModule } from '../database/database.module';
import { StatsService } from './stats.service';

describe('StatsController', () => {
    let controller: StatsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StatsController],
            imports: [DatabaseModule],
            providers: [StatsService],
        }).compile();

        controller = module.get<StatsController>(StatsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get stats', async () => {
        await controller.getStats({ dateRange: '7d' });
    });

    it('should get stats for custom range', async () => {
        const start = new Date();
        start.setDate(start.getDate() - 10);
        const end = new Date();
        await controller.getStats({
            dateRange: 'custom',
            customRange: [start, end],
        });
    });

    it('should get stats for a specific URL', async () => {
        await controller.getStats({
            dateRange: '30d',
            url: 'http://example.com',
        });
    });
});
