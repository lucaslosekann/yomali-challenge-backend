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

        let hourly = args.dateRange === '24h';

        let groupBy = Prisma.sql`DATE(timestamp)`;

        if (args.dateRange === '24h') {
            startDate = DateTime.now().minus({ hours: 24 });
            groupBy = Prisma.sql`DATE_FORMAT(timestamp, '%Y-%m-%dT%H:00:00Z')`;
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
                groupBy = Prisma.sql`DATE_FORMAT(timestamp, '%Y-%m-%dT%H:00:00Z')`;
                hourly = true;
            }
        } else {
            throw new Error('Invalid date range');
        }

        startDate = startDate.toUTC();
        endDate = endDate.toUTC();

        const pageUrlWhere = args.url
            ? Prisma.sql`AND pageUrl LIKE ${'%' + args.url + '%'}`
            : Prisma.sql``;

        const dateWhere = startDate.equals(endDate)
            ? Prisma.sql`WHERE DATE(timestamp) = ${startDate.toFormat('yyyy-MM-dd')}`
            : Prisma.sql`WHERE timestamp BETWEEN ${startDate} AND ${endDate}`;

        const statsPerDayPromise = this.prisma.$queryRaw`
            SELECT
                COUNT(*) AS total_visits,
                COUNT(DISTINCT visitorId) AS total_unique,
                ${groupBy} AS bucket
            FROM Visit
            ${dateWhere}
            ${pageUrlWhere}
            GROUP BY bucket WITH ROLLUP
            ORDER BY bucket;
        `;

        const statsPerPagePromise = this.prisma.$queryRaw`
            SELECT
                pageUrl,
                COUNT(*) AS total_visits,
                COUNT(DISTINCT visitorId) AS unique_visits
            FROM Visit
            ${dateWhere}
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
            hourly,
        };
    }
}
