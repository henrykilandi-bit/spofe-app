import { VenteGuardian } from "../../guardian/VenteGuardian";
export class ValidateQuoteHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardValidateQuote({
            quoteStatus: command.currentStatus,
            actor: command.actor,
        });
        const event = {
            eventType: "QuoteValidated",
            tenantId: command.actor.tenantId,
            quoteId: command.quoteId,
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=ValidateQuoteHandler.js.map