import { DeliveryNoteCreated } from "../../application/events/DeliveryNoteCreated";
import { DeliveryNoteValidated } from "../../application/events/DeliveryNoteValidated";

export class DeliveryProjectionHandler {
  constructor(private readonly db: any) {}

  async onDeliveryNoteCreated(event: DeliveryNoteCreated) {
    await this.db.insert("delivery_notes", {
      tenant_id: event.tenantId,
      delivery_note_id: event.deliveryNoteId,
      order_id: event.deliveryNoteId,
      status: "DRAFT",
      delivered_at: event.occurredAt,
    });
  }

  async onDeliveryNoteValidated(event: DeliveryNoteValidated) {
    await this.db.update(
      "delivery_notes",
      { status: "VALIDATED", delivered_at: event.occurredAt },
      { delivery_note_id: event.deliveryNoteId }
    );
  }
}
