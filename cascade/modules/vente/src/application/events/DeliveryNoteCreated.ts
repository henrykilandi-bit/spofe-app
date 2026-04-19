export interface DeliveryNoteCreated {
  eventType: "DeliveryNoteCreated";
  tenantId: string;
  deliveryNoteId: string;
  occurredAt: string;
}
