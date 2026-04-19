export class QuoteProjectionHandler {
    db;
    constructor(db) {
        this.db = db;
    }
    async onQuoteCreated(event) {
        await this.db.insert("sales_quotes", {
            tenant_id: event.tenantId,
            quote_id: event.quoteId,
            status: "DRAFT",
            created_at: event.occurredAt,
        });
    }
    async onQuoteValidated(event) {
        await this.db.update("sales_quotes", { status: "VALIDATED", validated_at: event.occurredAt }, { quote_id: event.quoteId });
    }
}
//# sourceMappingURL=QuoteProjectionHandler.js.map