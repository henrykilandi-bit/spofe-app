import { VenteGuardian } from "../../guardian/VenteGuardian";
import { CreateOrder } from "../commands/CreateOrder";
import { OrderCreated } from "../events/OrderCreated";

export class CreateOrderHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: CreateOrder): Promise<void> {
    VenteGuardian.guardCreateOrder(command);

    const event: OrderCreated = {
      eventType: "OrderCreated",
      tenantId: command.tenantId,
      orderId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
