import { OrderCreated } from "../../application/events/OrderCreated";
import { OrderValidated } from "../../application/events/OrderValidated";

export class OrderProjectionHandler {
  constructor(private readonly db: any) {}

  async onOrderCreated(event: OrderCreated) {
    await this.db.insert("sales_orders", {
      tenant_id: event.tenantId,
      order_id: event.orderId,
      quote_id: event.orderId,
      status: "DRAFT",
      created_at: event.occurredAt,
    });
  }

  async onOrderValidated(event: OrderValidated) {
    await this.db.update(
      "sales_orders",
      { status: "VALIDATED", validated_at: event.occurredAt },
      { order_id: event.orderId }
    );
  }
}
