import { Module } from '@nestjs/common';
import { TrackingModule } from './tracking/tracking.module';
import { DatabaseModule } from './database/database.module';
import { StatsModule } from './stats/stats.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            isGlobal: true,
            useFactory: (configService: ConfigService) => {
                if (!configService.get('REDIS_URL')) {
                    throw new Error('REDIS_URL is not defined');
                }
                const redis = new Keyv(
                    new KeyvRedis(configService.get('REDIS_URL')),
                );
                return {
                    stores: [redis],
                };
            },
        }),
        TrackingModule,
        DatabaseModule,
        StatsModule,
    ],
})
export class AppModule {}
