export class OrdersController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getOrders(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            res.status(400).json({ error: 'X-Tenant-Id header required' });
            return;
        }
        const orders = this.db.select('sales_orders', { where: { tenant_id: tenantId } });
        res.json(orders.map((o) => ({
            tenantId: o.tenant_id,
            orderId: o.order_id,
            quoteId: o.quote_id,
            status: o.status,
            createdAt: o.created_at,
            validatedAt: o.validated_at
        })));
    }
}
//# sourceMappingURL=OrdersController.js.map