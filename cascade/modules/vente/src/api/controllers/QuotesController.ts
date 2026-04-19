import { Request, Response } from 'express';

export class QuotesController {
  constructor(private readonly db: any) {}

  async getQuotes(req: Request, res: Response): Promise<void> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      res.status(400).json({ error: 'X-Tenant-Id header required' });
      return;
    }

    const quotes = this.db.select('sales_quotes', { where: { tenant_id: tenantId } });
    
    res.json(quotes.map((q: any) => ({
      tenantId: q.tenant_id,
      quoteId: q.quote_id,
      status: q.status,
      createdAt: q.created_at,
      validatedAt: q.validated_at
    })));
  }
}
