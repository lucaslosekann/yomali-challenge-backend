import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { DateTime } from 'luxon';
import { Prisma } from '../../generated/prisma';

type GetStatsArgs = {
    url?: string;
    dateRange: '24h' | '7d' | '30d' | 'custom';
    startDate?: string;
    endDate?: string;
};

type GetSessionsByPageUrlArgs = {
    url: string;
    dateRange: '24h' | '7d' | '30d' | 'custom';
    startDate?: string;
    endDate?: string;
    page: number;
};

@Injectable()
export class StatsService {
    private readonly PAGE_SIZE = 10;
    constructor(private prisma: PrismaService) {}

    async getSessionsByPageUrl(args: GetSessionsByPageUrlArgs) {
        const { startDate, endDate } = this.buildDateRange(args);

        const [sessions, totalSessions] = await Promise.all([
            this.prisma.session.findMany({
                where: {
                    startTime: {
                        gte: startDate.toJSDate(),
                        lte: endDate.toJSDate(),
                    },
                    PageView: {
                        some: {
                            pageUrl: args.url,
                        },
                    },
                },
                orderBy: { startTime: 'desc' },
                take: this.PAGE_SIZE,
                select: {
                    id: true,
                    ip: true,
                    browser: true,
                    os: true,
                    startTime: true,
                    endTime: true,
                    referrer: true,
                    userAgent: true,
                },
                skip: (args.page - 1) * this.PAGE_SIZE,
            }),
            this.prisma.session.count({
                where: {
                    startTime: {
                        gte: startDate.toJSDate(),
                        lte: endDate.toJSDate(),
                    },
                    PageView: {
                        some: {
                            pageUrl: args.url,
                        },
                    },
                },
            }),
        ]);
        return { sessions, total: totalSessions };
    }

    async getStats(args: GetStatsArgs) {
        const { startDate, endDate, hourly } = this.buildDateRange(args);

        let groupBy = Prisma.sql`DATE(pv.timestamp)`;
        if (hourly) {
            groupBy = Prisma.sql`DATE_FORMAT(pv.timestamp, '%Y-%m-%dT%H:00:00Z')`;
        }

        const pageUrlWhere = args.url
            ? Prisma.sql`AND pv.pageUrl LIKE ${'%' + args.url + '%'}`
            : Prisma.sql``;

        const dateWherePageViews = startDate.equals(endDate)
            ? Prisma.sql`WHERE DATE(pv.timestamp) = ${startDate.toFormat('yyyy-MM-dd')}`
            : Prisma.sql`WHERE pv.timestamp BETWEEN ${startDate} AND ${endDate}`;

        const dateWhereSessions = startDate.equals(endDate)
            ? Prisma.sql`WHERE DATE(s.startTime) = ${startDate.toFormat('yyyy-MM-dd')}`
            : Prisma.sql`WHERE s.startTime BETWEEN ${startDate} AND ${endDate}`;
        // Stats per day (or per hour)
        const statsPerDayPromise = this.prisma.$queryRaw`
            SELECT
                ${groupBy} AS bucket,
                COUNT(pv.id) AS total_visits,
                COUNT(DISTINCT pv.sessionId) AS total_unique
            FROM PageView pv
            JOIN Session s ON s.id = pv.sessionId
            ${dateWherePageViews}
            ${pageUrlWhere}
            GROUP BY bucket WITH ROLLUP
            ORDER BY bucket;
        `;

        // Top pages by unique visits
        const statsPerPagePromise = this.prisma.$queryRaw`
            SELECT
                pv.pageUrl,
                COUNT(pv.id) AS total_visits,
                COUNT(DISTINCT pv.sessionId) AS unique_visits
            FROM PageView pv
            JOIN Session s ON s.id = pv.sessionId
            ${dateWherePageViews}
            ${pageUrlWhere}
            GROUP BY pv.pageUrl
            ORDER BY unique_visits DESC
            LIMIT 10;
        `;

        // Avg session duration & short visits
        const sessionDurationPromise = this.prisma.$queryRaw<
            [
                {
                    avgSessionDuration: number;
                    shortVisitPercentage: number;
                },
            ]
        >`
            SELECT
                AVG(TIMESTAMPDIFF(SECOND, s.startTime, COALESCE(s.endTime, NOW()))) AS avgSessionDuration,
                SUM(CASE WHEN TIMESTAMPDIFF(SECOND, s.startTime, COALESCE(s.endTime, NOW())) < 60 THEN 1 ELSE 0 END) / COUNT(*) * 100 AS shortVisitPercentage
            FROM Session s
            ${dateWhereSessions};
        `;

        // Top browser
        const topBrowserPromise = this.prisma.$queryRaw<
            [
                {
                    name: string;
                    percentage: number;
                },
            ]
        >`
            SELECT browser AS name, COUNT(*) * 100 / (SELECT COUNT(*) FROM Session s ${dateWhereSessions}) AS percentage
            FROM Session s
            ${dateWhereSessions}
            AND browser IS NOT NULL
            GROUP BY browser
            ORDER BY COUNT(*) DESC
            LIMIT 1;
        `;

        // Top OS
        const topOSPromise = this.prisma.$queryRaw<
            [
                {
                    name: string;
                    percentage: number;
                },
            ]
        >`
            SELECT os AS name, COUNT(*) * 100 / (SELECT COUNT(*) FROM Session s ${dateWhereSessions}) AS percentage
            FROM Session s
            ${dateWhereSessions}
            AND os IS NOT NULL
            GROUP BY os
            ORDER BY COUNT(*) DESC
            LIMIT 1;
        `;

        // Top referrer
        const topReferrerPromise = this.prisma.$queryRaw<
            [
                {
                    name: string;
                    percentage: number;
                },
            ]
        >`
            SELECT referrer AS name, COUNT(*) * 100 / (SELECT COUNT(*) FROM Session s ${dateWhereSessions}) AS percentage
            FROM Session s
            ${dateWhereSessions}
            AND referrer IS NOT NULL
            GROUP BY referrer
            ORDER BY COUNT(*) DESC
            LIMIT 1;
        `;

        const [
            statsPerDay,
            statsPerPage,
            sessionDuration,
            topBrowser,
            topOs,
            topReferrer,
        ] = await Promise.all([
            statsPerDayPromise,
            statsPerPagePromise,
            sessionDurationPromise,
            topBrowserPromise,
            topOSPromise,
            topReferrerPromise,
        ]);
        return {
            statsPerDay,
            statsPerPage,
            sessionStats: {
                avgSessionDuration:
                    Number(sessionDuration[0]?.avgSessionDuration) || 0,
                shortVisitPercentage:
                    Number(sessionDuration[0]?.shortVisitPercentage) || 0,
                topBrowser: {
                    name: topBrowser[0]?.name || 'N/A',
                    percentage: Number(topBrowser[0]?.percentage) || 0,
                },
                topOS: {
                    name: topOs[0]?.name || 'N/A',
                    percentage: Number(topOs[0]?.percentage) || 0,
                },
                topReferrer: {
                    name: topReferrer[0]?.name || 'N/A',
                    percentage: Number(topReferrer[0]?.percentage) || 0,
                },
            },
            hourly,
        };
    }

    private buildDateRange(args: {
        dateRange: '24h' | '7d' | '30d' | 'custom';
        startDate?: string;
        endDate?: string;
    }) {
        let startDate: DateTime;
        let endDate: DateTime = DateTime.now();

        let hourly = args.dateRange === '24h';

        if (args.dateRange === '24h') {
            startDate = DateTime.now().minus({ hours: 24 });
        } else if (args.dateRange === '7d') {
            startDate = DateTime.now().minus({ days: 7 });
        } else if (args.dateRange === '30d') {
            startDate = DateTime.now().minus({ days: 30 });
        } else if (
            args.dateRange === 'custom' &&
            args.startDate &&
            args.endDate
        ) {
            startDate = DateTime.fromISO(args.startDate);
            endDate = DateTime.fromISO(args.endDate);

            if (endDate.diff(startDate, 'days').days < 2) {
                hourly = true;
            }
        } else {
            throw new Error('Invalid date range');
        }

        return {
            startDate: startDate.toUTC(),
            endDate: endDate.toUTC(),
            hourly,
        };
    }
}
