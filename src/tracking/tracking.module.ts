import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    providers: [TrackingService],
    controllers: [TrackingController],
    imports: [DatabaseModule],
})
export class TrackingModule {}
