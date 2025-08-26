import { GetSessionsDto } from './dto/get-sessions.dto';
import { GetStatsDto } from './dto/get-stats.dto';
import { StatsService } from './stats.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get()
    async getStats(@Query() filters: GetStatsDto) {
        const data = await this.statsService.getStats(filters);
        const json = JSON.stringify(data, (key, value: unknown) =>
            typeof value === 'bigint'
                ? Number.parseInt(value.toString())
                : value,
        );
        return json;
    }

    @Get('sessions')
    async getSessionsByPageUrl(@Query() filters: GetSessionsDto) {
        const data = await this.statsService.getSessionsByPageUrl(filters);
        return data;
    }
}
