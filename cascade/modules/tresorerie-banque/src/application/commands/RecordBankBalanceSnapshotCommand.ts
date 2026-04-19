export interface RecordBankBalanceSnapshotCommand {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  documentId: string;
  balance: number;
  bankDate: string;
  actorId: string;
}
