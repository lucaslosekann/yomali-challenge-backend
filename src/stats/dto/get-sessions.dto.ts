import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsIn, ValidateIf, IsISO8601, Min } from 'class-validator';

export class GetSessionsDto {
    @IsOptional()
    @ApiProperty()
    url: string;

    @IsIn(['24h', '7d', '30d', 'custom'])
    @ApiProperty()
    dateRange: '24h' | '7d' | '30d' | 'custom';

    @ValidateIf((o: GetSessionsDto) => o.dateRange === 'custom')
    @IsISO8601()
    @ApiProperty({ required: false })
    startDate?: string;

    @ValidateIf((o: GetSessionsDto) => o.dateRange === 'custom')
    @IsISO8601()
    @ApiProperty({ required: false })
    endDate?: string;

    @ApiProperty()
    @Min(1)
    @Type(() => Number)
    page: number;
}
