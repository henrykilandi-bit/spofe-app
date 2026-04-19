import { BankMovementView } from "../views/BankMovementView";

export class BankMovementProjection {
  project(event: any): BankMovementView | null {
    if (event.type === "BankDebitRecorded") {
      return {
        tenantId: event.tenantId,
        bankId: event.bankId,
        bankAccountId: event.bankAccountId,
        externalReference: event.externalReference,
        type: "DEBIT",
        amount: event.amount,
        bankDate: event.bankDate,
        documentId: event.documentId,
        recordedAt: event.recordedAt
      };
    }

    if (event.type === "BankCreditRecorded") {
      return {
        tenantId: event.tenantId,
        bankId: event.bankId,
        bankAccountId: event.bankAccountId,
        externalReference: event.externalReference,
        type: "CREDIT",
        amount: event.amount,
        bankDate: event.bankDate,
        documentId: event.documentId,
        recordedAt: event.recordedAt
      };
    }

    return null;
  }
}
