export interface RecordBankCreditCommand {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  externalReference: string;
  documentId: string;
  amount: number;
  bankDate: string;
  actorId: string;
}
