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

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) {}

    async getStats(args: GetStatsArgs) {
        let startDate: DateTime;
        let endDate: DateTime = DateTime.now();

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
        } else {
            throw new Error('Invalid date range');
        }

        const pageUrlWhere = args.url
            ? Prisma.sql`AND pageUrl LIKE ${'%' + args.url + '%'}`
            : Prisma.sql``;

        const statsPerDayPromise = this.prisma.$queryRaw`
            SELECT
                COUNT(*) AS total_visits,
                COUNT(DISTINCT visitorId) AS total_unique,
                DATE(timestamp) AS day
            FROM Visit
            WHERE timestamp BETWEEN ${startDate} AND ${endDate}
                ${pageUrlWhere}
            GROUP BY DATE(timestamp) WITH ROLLUP
            ORDER BY day;
        `;

        const statsPerPagePromise = this.prisma.$queryRaw`
            SELECT
                pageUrl,
                COUNT(*) AS total_visits,
                COUNT(DISTINCT visitorId) AS unique_visits
            FROM Visit
            WHERE timestamp BETWEEN ${startDate} AND ${endDate}
                ${pageUrlWhere}
            GROUP BY pageUrl
            ORDER BY unique_visits DESC
            LIMIT 10;
        `;

        const [statsPerDay, statsPerPage] = await Promise.all([
            statsPerDayPromise,
            statsPerPagePromise,
        ]);

        return {
            statsPerDay,
            statsPerPage,
        };
    }
}
