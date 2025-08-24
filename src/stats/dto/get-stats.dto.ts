import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, ValidateIf, IsISO8601 } from 'class-validator';

export class GetStatsDto {
    @IsOptional()
    @ApiProperty()
    url?: string;

    @IsIn(['24h', '7d', '30d', 'custom'])
    @ApiProperty()
    dateRange: '24h' | '7d' | '30d' | 'custom';

    @ValidateIf((o: GetStatsDto) => o.dateRange === 'custom')
    @IsISO8601()
    @ApiProperty({ required: false })
    startDate?: string;

    @ValidateIf((o: GetStatsDto) => o.dateRange === 'custom')
    @IsISO8601()
    @ApiProperty({ required: false })
    endDate?: string;
}
