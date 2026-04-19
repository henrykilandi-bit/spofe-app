import { VenteGuardian } from "../../guardian/VenteGuardian";
export class CreateInvoiceHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardCreateInvoice(command);
        const event = {
            eventType: "InvoiceCreated",
            tenantId: command.tenantId,
            invoiceId: crypto.randomUUID(),
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=CreateInvoiceHandler.js.map