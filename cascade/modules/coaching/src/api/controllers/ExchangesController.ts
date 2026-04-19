import { Request, Response } from 'express';
import { CoachingExchangeRM } from '../../read-models/models/CoachingExchangeRM';

export class ExchangesController {
  static async list(req: Request, res: Response) {
    const tenantId = req.headers['tenant-id'] as string;

    const exchanges: CoachingExchangeRM[] = [];

    res.json(exchanges.filter(e => e.tenantId === tenantId));
  }
}
