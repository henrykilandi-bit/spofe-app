export class InvoicesController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getInvoices(req, res) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            res.status(400).json({ error: 'X-Tenant-Id header required' });
            return;
        }
        const invoices = this.db.select('sales_invoices', { where: { tenant_id: tenantId } });
        res.json(invoices.map((i) => ({
            tenantId: i.tenant_id,
            invoiceId: i.invoice_id,
            orderId: i.order_id,
            deliveryNoteId: i.delivery_note_id,
            status: i.status,
            issuedAt: i.issued_at
        })));
    }
}
//# sourceMappingURL=InvoicesController.js.map