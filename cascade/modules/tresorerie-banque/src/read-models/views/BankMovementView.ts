export interface BankMovementView {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  externalReference: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  bankDate: string;
  documentId: string;
  recordedAt: string;
}
