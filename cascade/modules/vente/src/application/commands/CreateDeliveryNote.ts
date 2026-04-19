export interface CreateDeliveryNote {
  tenantId: string;
  orderValidated: boolean;
  actor: {
    actorId: string;
    tenantId: string;
  };
}
