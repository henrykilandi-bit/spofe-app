import { Request, Response } from 'express';
import { CoachingActionPlanRM } from '../../read-models/models/CoachingActionPlanRM';

export class ActionsController {
  static async list(req: Request, res: Response) {
    const tenantId = req.headers['tenant-id'] as string;

    const actions: CoachingActionPlanRM[] = [];

    res.json(actions.filter(a => a.tenantId === tenantId));
  }
}
