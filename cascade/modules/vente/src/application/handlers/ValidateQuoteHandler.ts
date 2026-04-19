import { VenteGuardian } from "../../guardian/VenteGuardian";
import { ValidateQuote } from "../commands/ValidateQuote";
import { QuoteValidated } from "../events/QuoteValidated";

export class ValidateQuoteHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: ValidateQuote): Promise<void> {
    VenteGuardian.guardValidateQuote({
      quoteStatus: command.currentStatus,
      actor: command.actor,
    });

    const event: QuoteValidated = {
      eventType: "QuoteValidated",
      tenantId: command.actor.tenantId,
      quoteId: command.quoteId,
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
