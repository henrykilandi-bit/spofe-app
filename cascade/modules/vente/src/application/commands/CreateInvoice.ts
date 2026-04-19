export interface CreateInvoice {
  tenantId: string;
  hasDeliveryOrOrder: boolean;
  actor: {
    actorId: string;
    tenantId: string;
  };
}
