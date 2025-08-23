import { IsUrl, IsUUID } from 'class-validator';

export class CreateVisitDto {
    @IsUrl()
    pageUrl: string;

    @IsUUID()
    visitorId: string;
}
