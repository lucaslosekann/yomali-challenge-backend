import { Body, Controller, Post } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateVisitDto } from './dto/create-visit.dto';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) {}

    @Post()
    create(@Body() event: CreateVisitDto) {
        return this.trackingService.trackVisit(event);
    }
}
