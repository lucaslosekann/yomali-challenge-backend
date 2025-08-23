import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';

describe('TrackingController', () => {
  let controller: TrackingController;

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
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
    };

    await controller.create(visitData);

    expect(trackVisitSpy).toHaveBeenCalledWith(visitData);
  });

  it('should return the result from trackVisit', async () => {
    const visitData = {
      pageUrl: 'http://example.com',
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
    };
    const result = await controller.create(visitData);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('timestamp');
    expect(result.pageUrl).toBe(visitData.pageUrl);
    expect(result.visitorId).toBe(visitData.visitorId);
  });
});
