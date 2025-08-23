import { Module } from '@nestjs/common';
import { TrackingModule } from './tracking/tracking.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TrackingModule, DatabaseModule],
})
export class AppModule {}
