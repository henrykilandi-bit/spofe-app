export interface BankJournalView {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  externalReference?: string;
  eventType: string;
  amount?: number;
  balance?: number;
  bankDate: string;
  documentId: string;
  recordedAt: string;
}
