import { VenteGuardian } from "../../guardian/VenteGuardian";
export class CreateOrderHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardCreateOrder(command);
        const event = {
            eventType: "OrderCreated",
            tenantId: command.tenantId,
            orderId: crypto.randomUUID(),
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=CreateOrderHandler.js.map