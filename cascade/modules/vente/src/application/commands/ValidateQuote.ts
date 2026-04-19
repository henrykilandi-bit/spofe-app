export interface ValidateQuote {
  quoteId: string;
  currentStatus: "DRAFT";
  actor: {
    actorId: string;
    tenantId: string;
  };
}
