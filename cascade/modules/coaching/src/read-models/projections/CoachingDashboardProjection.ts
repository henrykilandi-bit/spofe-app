import { CoachingDashboardRM } from '../models/CoachingDashboardRM';

export class CoachingDashboardProjection {
  createEmpty(tenantId: string): CoachingDashboardRM {
    return {
      tenantId,
      indicators: {},
      statusFlags: {},
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}
