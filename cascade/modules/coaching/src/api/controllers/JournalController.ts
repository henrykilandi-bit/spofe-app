import { Request, Response } from 'express';
import { CoachingJournalRM } from '../../read-models/models/CoachingJournalRM';

export class JournalController {
  static async list(req: Request, res: Response) {
    const tenantId = req.headers['tenant-id'] as string;

    const result: CoachingJournalRM[] = []; // projection store

    res.json(result.filter(r => r.tenantId === tenantId));
  }
}
