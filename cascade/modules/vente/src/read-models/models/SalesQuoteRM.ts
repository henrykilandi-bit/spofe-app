export interface SalesQuoteRM {
  tenantId: string;
  quoteId: string;
  status: "DRAFT" | "VALIDATED";
  createdAt: string;
  validatedAt?: string;
}
