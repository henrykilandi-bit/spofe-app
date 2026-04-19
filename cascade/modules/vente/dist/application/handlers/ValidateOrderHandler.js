import { VenteGuardian } from "../../guardian/VenteGuardian";
export class ValidateOrderHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardValidateOrder({
            orderStatus: command.currentStatus,
            actor: command.actor,
        });
        const event = {
            eventType: "OrderValidated",
            tenantId: command.actor.tenantId,
            orderId: command.orderId,
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=ValidateOrderHandler.js.map