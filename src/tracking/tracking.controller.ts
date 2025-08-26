import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { VisitDto } from './dto/visit.dto';
import type { Request } from 'express';
import { PingDto } from './dto/ping.dto';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) {}

    @Post()
    async create(
        @Body() event: VisitDto,
        @Ip() ip: string,
        @Req() request: Request,
    ) {
        const activeSession = await this.trackingService.getActiveSession(
            event.visitorId,
        );

        if (activeSession) {
            await this.trackingService.updateSessionAndAddPageView(
                activeSession.id,
                event.pageUrl,
            );
            return {
                message: 'Page view added to existing session',
                sessionId: activeSession.id,
            };
        } else {
            const session = await this.trackingService.trackVisit(
                event,
                ip,
                request['headers']['user-agent'],
            );
            return { message: 'New session created', sessionId: session.id };
        }
    }

    @Post('ping')
    async ping(@Body() body: PingDto) {
        const activeSession = await this.trackingService.getActiveSession(
            body.visitorId,
        );
        if (!activeSession) {
            return { message: 'No active session found' };
        }
        await this.trackingService.updateSession(activeSession.id);
        return { message: 'Session updated', sessionId: activeSession.id };
    }
}
