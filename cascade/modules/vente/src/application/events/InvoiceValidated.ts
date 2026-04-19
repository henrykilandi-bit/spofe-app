export interface InvoiceValidated {
  eventType: "InvoiceValidated";
  tenantId: string;
  invoiceId: string;
  occurredAt: string;
}
