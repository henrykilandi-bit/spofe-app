export class DeliveryProjectionHandler {
    db;
    constructor(db) {
        this.db = db;
    }
    async onDeliveryNoteCreated(event) {
        await this.db.insert("delivery_notes", {
            tenant_id: event.tenantId,
            delivery_note_id: event.deliveryNoteId,
            order_id: event.deliveryNoteId,
            status: "DRAFT",
            delivered_at: event.occurredAt,
        });
    }
    async onDeliveryNoteValidated(event) {
        await this.db.update("delivery_notes", { status: "VALIDATED", delivered_at: event.occurredAt }, { delivery_note_id: event.deliveryNoteId });
    }
}
//# sourceMappingURL=DeliveryProjectionHandler.js.map