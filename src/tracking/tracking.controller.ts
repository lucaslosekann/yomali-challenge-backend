import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) {}

    @Post()
    async create(@Body() body: unknown) {
        console.log(body);
        //JSON
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch {
                throw new BadRequestException('Invalid JSON');
            }
        }
        //Validate with DTO
        const event = plainToInstance(CreateVisitDto, body);
        const errors = await validate(event);
        if (errors.length > 0) {
            throw new BadRequestException(
                errors.map((e) => Object.values(e.constraints ?? {})).flat(),
            );
        }

        return this.trackingService.trackVisit(event);
    }
}
