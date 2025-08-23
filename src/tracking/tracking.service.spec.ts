import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';

describe('TrackingService', () => {
  let service: TrackingService;

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
    };
    const result = await service.trackVisit(visitData);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('timestamp');
    expect(result.pageUrl).toBe(visitData.pageUrl);
    expect(result.visitorId).toBe(visitData.visitorId);
  });

  it('should handle database errors gracefully', async () => {
    jest.spyOn(service['prisma'].visit, 'create').mockImplementation(() => {
      throw new Error('Database error');
    });
    const visitData = {
      pageUrl: 'http://example.com',
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
    };
    await expect(service.trackVisit(visitData)).rejects.toThrow(
      'Database error',
    );
  });
});
