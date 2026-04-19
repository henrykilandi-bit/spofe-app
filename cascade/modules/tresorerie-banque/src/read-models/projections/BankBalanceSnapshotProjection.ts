import { BankBalanceSnapshotView } from "../views/BankBalanceSnapshotView";

export class BankBalanceSnapshotProjection {
  project(event: any): BankBalanceSnapshotView | null {
    if (event.type !== "BankBalanceSnapshotRecorded") return null;

    return {
      tenantId: event.tenantId,
      bankId: event.bankId,
      bankAccountId: event.bankAccountId,
      balance: event.balance,
      bankDate: event.bankDate,
      documentId: event.documentId,
      recordedAt: event.recordedAt
    };
  }
}
