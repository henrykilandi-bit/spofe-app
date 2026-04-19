export interface CreateOrder {
  tenantId: string;
  quoteValidated: boolean;
  actor: {
    actorId: string;
    tenantId: string;
  };
}
