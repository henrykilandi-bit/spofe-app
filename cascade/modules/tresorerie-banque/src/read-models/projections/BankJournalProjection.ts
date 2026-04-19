import { BankJournalView } from "../views/BankJournalView";

export class BankJournalProjection {
  project(event: any): BankJournalView {
    return {
      tenantId: event.tenantId,
      bankId: event.bankId,
      bankAccountId: event.bankAccountId,
      externalReference: event.externalReference,
      eventType: event.type,
      amount: event.amount,
      balance: event.balance,
      bankDate: event.bankDate || event.documentDate,
      documentId: event.documentId,
      recordedAt: event.recordedAt || event.registeredAt
    };
  }
}
