export interface ValidateDeliveryNote {
  deliveryNoteId: string;
  currentStatus: "DRAFT";
  actor: {
    actorId: string;
    tenantId: string;
  };
}
