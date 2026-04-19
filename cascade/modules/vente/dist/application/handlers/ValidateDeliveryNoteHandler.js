import { VenteGuardian } from "../../guardian/VenteGuardian";
export class ValidateDeliveryNoteHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardValidateDeliveryNote({
            deliveryStatus: command.currentStatus,
            actor: command.actor,
        });
        const event = {
            eventType: "DeliveryNoteValidated",
            tenantId: command.actor.tenantId,
            deliveryNoteId: command.deliveryNoteId,
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=ValidateDeliveryNoteHandler.js.map