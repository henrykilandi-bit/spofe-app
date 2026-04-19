export interface BankBalanceSnapshotView {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  balance: number;
  bankDate: string;
  documentId: string;
  recordedAt: string;
}
