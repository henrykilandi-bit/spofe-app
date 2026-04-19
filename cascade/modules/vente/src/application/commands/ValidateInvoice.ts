export interface ValidateInvoice {
  invoiceId: string;
  currentStatus: "DRAFT";
  actor: {
    actorId: string;
    tenantId: string;
  };
}
