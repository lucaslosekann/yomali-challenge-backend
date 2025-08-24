import { IsOptional, IsIn, ValidateIf, IsISO8601 } from 'class-validator';

export class GetStatsDto {
    @IsOptional()
    url?: string;

    @IsIn(['24h', '7d', '30d', 'custom'])
    dateRange: '24h' | '7d' | '30d' | 'custom';

    @ValidateIf((o: GetStatsDto) => o.dateRange === 'custom')
    @IsISO8601()
    startDate?: string;

    @ValidateIf((o: GetStatsDto) => o.dateRange === 'custom')
    @IsISO8601()
    endDate?: string;
}
