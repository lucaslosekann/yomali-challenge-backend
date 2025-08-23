import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

type TrackVisitArgs = {
  pageUrl: string;
  visitorId: string;
};

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async trackVisit(visit: TrackVisitArgs) {
    return this.prisma.visit.create({
      data: visit,
    });
  }
}
