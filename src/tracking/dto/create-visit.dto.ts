import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsUUID } from 'class-validator';

export class CreateVisitDto {
    @ApiProperty()
    @IsUrl()
    pageUrl: string;

    @ApiProperty()
    @IsUUID()
    visitorId: string;
}
