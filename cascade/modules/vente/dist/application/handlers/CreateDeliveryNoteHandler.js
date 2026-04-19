import { VenteGuardian } from "../../guardian/VenteGuardian";
export class CreateDeliveryNoteHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardCreateDeliveryNote(command);
        const event = {
            eventType: "DeliveryNoteCreated",
            tenantId: command.tenantId,
            deliveryNoteId: crypto.randomUUID(),
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=CreateDeliveryNoteHandler.js.map