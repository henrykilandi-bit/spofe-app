export interface RecordBankDebitCommand {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  externalReference: string;
  documentId: string;
  amount: number;
  bankDate: string;
  actorId: string;
}
