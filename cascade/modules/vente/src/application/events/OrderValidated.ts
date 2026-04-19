export interface OrderValidated {
  eventType: "OrderValidated";
  tenantId: string;
  orderId: string;
  occurredAt: string;
}
