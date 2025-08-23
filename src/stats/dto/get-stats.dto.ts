import {
    IsOptional,
    IsUrl,
    IsIn,
    ValidateIf,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetStatsDto {
    @IsOptional()
    @IsUrl()
    url?: string;

    @IsIn(['24h', '7d', '30d', 'custom'])
    dateRange: '24h' | '7d' | '30d' | 'custom';

    @ValidateIf((o: GetStatsDto) => o.dateRange === 'custom')
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @Type(() => Date)
    @IsDate({ each: true })
    customRange?: [Date, Date];
}
