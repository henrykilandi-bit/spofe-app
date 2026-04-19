export class InvoiceProjectionHandler {
    db;
    constructor(db) {
        this.db = db;
    }
    async onInvoiceCreated(event) {
        await this.db.insert("sales_invoices", {
            tenant_id: event.tenantId,
            invoice_id: event.invoiceId,
            order_id: event.invoiceId,
            delivery_note_id: event.invoiceId,
            status: "DRAFT",
            issued_at: event.occurredAt,
        });
    }
    async onInvoiceValidated(event) {
        await this.db.update("sales_invoices", { status: "VALIDATED", issued_at: event.occurredAt }, { invoice_id: event.invoiceId });
    }
}
//# sourceMappingURL=InvoiceProjectionHandler.js.map