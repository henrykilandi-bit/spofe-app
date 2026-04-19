export class QuotesController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getQuotes(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            res.status(400).json({ error: 'X-Tenant-Id header required' });
            return;
        }
        const quotes = this.db.select('sales_quotes', { where: { tenant_id: tenantId } });
        res.json(quotes.map((q) => ({
            tenantId: q.tenant_id,
            quoteId: q.quote_id,
            status: q.status,
            createdAt: q.created_at,
            validatedAt: q.validated_at
        })));
    }
}
//# sourceMappingURL=QuotesController.js.map