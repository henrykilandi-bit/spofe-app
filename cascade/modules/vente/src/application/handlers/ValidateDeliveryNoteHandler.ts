import { VenteGuardian } from "../../guardian/VenteGuardian";
import { ValidateDeliveryNote } from "../commands/ValidateDeliveryNote";
import { DeliveryNoteValidated } from "../events/DeliveryNoteValidated";

export class ValidateDeliveryNoteHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: ValidateDeliveryNote): Promise<void> {
    VenteGuardian.guardValidateDeliveryNote({
      deliveryStatus: command.currentStatus,
      actor: command.actor,
    });

    const event: DeliveryNoteValidated = {
      eventType: "DeliveryNoteValidated",
      tenantId: command.actor.tenantId,
      deliveryNoteId: command.deliveryNoteId,
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
