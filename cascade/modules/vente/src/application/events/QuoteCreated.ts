export interface QuoteCreated {
  eventType: "QuoteCreated";
  tenantId: string;
  quoteId: string;
  occurredAt: string;
}
