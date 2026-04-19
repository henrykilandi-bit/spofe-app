import { QuoteCreated } from "../../application/events/QuoteCreated";
import { QuoteValidated } from "../../application/events/QuoteValidated";

export class QuoteProjectionHandler {
  constructor(private readonly db: any) {}

  async onQuoteCreated(event: QuoteCreated) {
    await this.db.insert("sales_quotes", {
      tenant_id: event.tenantId,
      quote_id: event.quoteId,
      status: "DRAFT",
      created_at: event.occurredAt,
    });
  }

  async onQuoteValidated(event: QuoteValidated) {
    await this.db.update(
      "sales_quotes",
      { status: "VALIDATED", validated_at: event.occurredAt },
      { quote_id: event.quoteId }
    );
  }
}
