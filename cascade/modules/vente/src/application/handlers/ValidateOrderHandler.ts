import { VenteGuardian } from "../../guardian/VenteGuardian";
import { ValidateOrder } from "../commands/ValidateOrder";
import { OrderValidated } from "../events/OrderValidated";

export class ValidateOrderHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: ValidateOrder): Promise<void> {
    VenteGuardian.guardValidateOrder({
      orderStatus: command.currentStatus,
      actor: command.actor,
    });

    const event: OrderValidated = {
      eventType: "OrderValidated",
      tenantId: command.actor.tenantId,
      orderId: command.orderId,
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
