export interface RegisterBankDocumentCommand {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  documentId: string;
  documentType: "STATEMENT" | "DEBIT_NOTICE" | "CREDIT_NOTICE";
  documentDate: string;
  actorId: string;
}
