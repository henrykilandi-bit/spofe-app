import { Request, Response } from 'express';

export class DeliveriesController {
  constructor(private readonly db: any) {}

  async getDeliveries(req: Request, res: Response): Promise<void> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      res.status(400).json({ error: 'X-Tenant-Id header required' });
      return;
    }

    const deliveries = this.db.select('delivery_notes', { where: { tenant_id: tenantId } });
    
    res.json(deliveries.map((d: any) => ({
      tenantId: d.tenant_id,
      deliveryNoteId: d.delivery_note_id,
      orderId: d.order_id,
      status: d.status,
      deliveredAt: d.delivered_at
    })));
  }
}
