import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    ValidateNested,
} from 'class-validator';

class MetadataDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referrer?: string;
}

export class VisitDto {
    @ApiProperty()
    @IsUrl({
        require_tld: false,
    })
    pageUrl: string;

    @ApiProperty()
    @IsUUID()
    visitorId: string;

    @ApiProperty({ type: MetadataDto })
    @ValidateNested()
    @Type(() => MetadataDto)
    @IsObject()
    metadata: MetadataDto;
}
