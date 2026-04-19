export interface DeliveryNoteValidated {
  eventType: "DeliveryNoteValidated";
  tenantId: string;
  deliveryNoteId: string;
  occurredAt: string;
}
