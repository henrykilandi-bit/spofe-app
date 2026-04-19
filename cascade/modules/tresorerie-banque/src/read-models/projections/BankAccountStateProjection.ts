import { BankAccountStateView } from "../views/BankAccountStateView";

export class BankAccountStateProjection {
  project(
    current: BankAccountStateView | null,
    event: any
  ): BankAccountStateView | null {
    if (event.type === "BankAccountRegistered") {
      return {
        tenantId: event.tenantId,
        bankId: event.bankId,
        bankAccountId: event.bankAccountId,
        currency: event.currency,
        status: "ACTIVE"
      };
    }

    if (event.type === "BankBalanceSnapshotRecorded" && current) {
      return {
        ...current,
        lastBankDate: event.bankDate,
        lastBalance: event.balance
      };
    }

    return current;
  }
}
