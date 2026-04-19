export class DeliveriesController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getDeliveries(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            res.status(400).json({ error: 'X-Tenant-Id header required' });
            return;
        }
        const deliveries = this.db.select('delivery_notes', { where: { tenant_id: tenantId } });
        res.json(deliveries.map((d) => ({
            tenantId: d.tenant_id,
            deliveryNoteId: d.delivery_note_id,
            orderId: d.order_id,
            status: d.status,
            deliveredAt: d.delivered_at
        })));
    }
}
//# sourceMappingURL=DeliveriesController.js.map