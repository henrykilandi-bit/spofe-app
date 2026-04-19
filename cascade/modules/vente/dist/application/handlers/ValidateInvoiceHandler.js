import { VenteGuardian } from "../../guardian/VenteGuardian";
export class ValidateInvoiceHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardValidateInvoice({
            invoiceStatus: command.currentStatus,
            actor: command.actor,
        });
        const event = {
            eventType: "InvoiceValidated",
            tenantId: command.actor.tenantId,
            invoiceId: command.invoiceId,
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=ValidateInvoiceHandler.js.map