export class OrderProjectionHandler {
    db;
    constructor(db) {
        this.db = db;
    }
    async onOrderCreated(event) {
        await this.db.insert("sales_orders", {
            tenant_id: event.tenantId,
            order_id: event.orderId,
            quote_id: event.orderId,
            status: "DRAFT",
            created_at: event.occurredAt,
        });
    }
    async onOrderValidated(event) {
        await this.db.update("sales_orders", { status: "VALIDATED", validated_at: event.occurredAt }, { order_id: event.orderId });
    }
}
//# sourceMappingURL=OrderProjectionHandler.js.map