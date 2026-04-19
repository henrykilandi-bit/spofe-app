import { Request, Response } from 'express';
import { CoachingDashboardRM } from '../../read-models/models/CoachingDashboardRM';

export class DashboardController {
  static async getDashboard(req: Request, res: Response) {
    const tenantId = req.headers['tenant-id'] as string;

    const dashboard: CoachingDashboardRM = {
      tenantId,
      indicators: {},
      statusFlags: {},
      lastUpdatedAt: new Date().toISOString(),
    };

    res.json(dashboard);
  }
}
