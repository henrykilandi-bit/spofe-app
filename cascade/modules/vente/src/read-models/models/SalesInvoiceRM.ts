export interface SalesInvoiceRM {
  tenantId: string;
  invoiceId: string;
  orderId: string;
  deliveryNoteId?: string;
  status: "DRAFT" | "VALIDATED";
  issuedAt?: string;
}
