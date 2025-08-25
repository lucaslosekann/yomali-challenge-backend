import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { DateTime } from 'luxon';
import { VisitDto } from './dto/visit.dto';
import { UAParser } from 'ua-parser-js';

function buildBrowserOSString({
    name,
    version,
}: {
    name?: string;
    version?: string;
}): string | null {
    if (!name) return null;
    if (!version) return name;
    return `${name} ${version}`;
}

@Injectable()
export class TrackingService {
    constructor(private prisma: PrismaService) {}

    async trackVisit(visit: VisitDto, ip: string, userAgent?: string) {
        const now = DateTime.now().toJSDate();

        const parser = new UAParser(userAgent);
        const browser = parser.getBrowser();
        const os = parser.getOS();

        return this.prisma.session.create({
            data: {
                visitorId: visit.visitorId,
                startTime: now,
                endTime: now,
                ip: ip,
                userAgent: userAgent ?? 'Unknown',
                browser: buildBrowserOSString(browser),
                os: buildBrowserOSString(os),
                referrer: visit.metadata.referrer,
                PageView: {
                    create: {
                        pageUrl: visit.pageUrl,
                        timestamp: now,
                    },
                },
            },
        });
    }

    async updateSessionAndAddPageView(sessionId: number, pageUrl: string) {
        const now = DateTime.now().toJSDate();
        return this.prisma.$transaction([
            this.prisma.session.update({
                where: { id: sessionId },
                data: { endTime: now },
            }),
            this.prisma.pageView.create({
                data: {
                    pageUrl,
                    timestamp: now,
                    sessionId,
                },
            }),
        ]);
    }

    getActiveSession(visitorId: string) {
        const thirtyMinutesAgo = DateTime.now()
            .minus({ minutes: 30 })
            .toJSDate();

        return this.prisma.session.findFirst({
            where: {
                visitorId,
                endTime: {
                    gte: thirtyMinutesAgo,
                },
            },
            orderBy: {
                startTime: 'desc',
            },
        });
    }
}
