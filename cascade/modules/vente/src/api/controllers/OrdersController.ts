import { Request, Response } from 'express';

export class OrdersController {
  constructor(private readonly db: any) {}

  async getOrders(req: Request, res: Response): Promise<void> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      res.status(400).json({ error: 'X-Tenant-Id header required' });
      return;
    }

    const orders = this.db.select('sales_orders', { where: { tenant_id: tenantId } });
    
    res.json(orders.map((o: any) => ({
      tenantId: o.tenant_id,
      orderId: o.order_id,
      quoteId: o.quote_id,
      status: o.status,
      createdAt: o.created_at,
      validatedAt: o.validated_at
    })));
  }
}
