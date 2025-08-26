import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsUUID } from 'class-validator';

export class PingDto {
    @ApiProperty()
    @IsUrl({
        require_tld: false,
    })
    pageUrl: string;

    @ApiProperty()
    @IsUUID()
    visitorId: string;
}
