import { Module } from '@nestjs/common';
import { TrackingModule } from './tracking/tracking.module';
import { DatabaseModule } from './database/database.module';
import { StatsModule } from './stats/stats.module';

@Module({
    imports: [TrackingModule, DatabaseModule, StatsModule],
})
export class AppModule {}
