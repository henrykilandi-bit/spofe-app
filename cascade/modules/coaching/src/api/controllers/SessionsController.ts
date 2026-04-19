import { Request, Response } from 'express';
import { CoachingSessionRM } from '../../read-models/models/CoachingSessionRM';

export class SessionsController {
  static async list(req: Request, res: Response) {
    const tenantId = req.headers['tenant-id'] as string;

    const sessions: CoachingSessionRM[] = [];

    res.json(sessions.filter(s => s.tenantId === tenantId));
  }
}
