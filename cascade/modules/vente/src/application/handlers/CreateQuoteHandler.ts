import { VenteGuardian } from "../../guardian/VenteGuardian";
import { CreateQuote } from "../commands/CreateQuote";
import { QuoteCreated } from "../events/QuoteCreated";

export class CreateQuoteHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: CreateQuote): Promise<void> {
    VenteGuardian.guardCreateQuote(command);

    const event: QuoteCreated = {
      eventType: "QuoteCreated",
      tenantId: command.tenantId,
      quoteId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
