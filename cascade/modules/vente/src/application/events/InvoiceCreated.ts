export interface InvoiceCreated {
  eventType: "InvoiceCreated";
  tenantId: string;
  invoiceId: string;
  occurredAt: string;
}
