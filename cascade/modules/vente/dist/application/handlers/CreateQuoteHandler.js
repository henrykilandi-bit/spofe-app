import { VenteGuardian } from "../../guardian/VenteGuardian";
export class CreateQuoteHandler {
    eventStore;
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async handle(command) {
        VenteGuardian.guardCreateQuote(command);
        const event = {
            eventType: "QuoteCreated",
            tenantId: command.tenantId,
            quoteId: crypto.randomUUID(),
            occurredAt: new Date().toISOString(),
        };
        await this.eventStore.append(event);
    }
}
//# sourceMappingURL=CreateQuoteHandler.js.map