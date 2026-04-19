import { VenteGuardian } from "../../guardian/VenteGuardian";
import { CreateDeliveryNote } from "../commands/CreateDeliveryNote";
import { DeliveryNoteCreated } from "../events/DeliveryNoteCreated";

export class CreateDeliveryNoteHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: CreateDeliveryNote): Promise<void> {
    VenteGuardian.guardCreateDeliveryNote(command);

    const event: DeliveryNoteCreated = {
      eventType: "DeliveryNoteCreated",
      tenantId: command.tenantId,
      deliveryNoteId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
