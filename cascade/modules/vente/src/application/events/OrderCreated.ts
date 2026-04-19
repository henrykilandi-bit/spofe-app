export interface OrderCreated {
  eventType: "OrderCreated";
  tenantId: string;
  orderId: string;
  occurredAt: string;
}
