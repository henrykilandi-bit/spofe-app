import {
  BankAccountStateView,
  BankJournalView,
  BankMovementView,
  BankDocumentView,
  BankBalanceSnapshotView
} from "../../read-models";

export interface BankReadRepositoryPort {
  getAccounts(params: {
    tenantId: string;
    bankId?: string;
    status?: "ACTIVE" | "INACTIVE";
  }): Promise<BankAccountStateView[]>;

  getAccountState(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
  }): Promise<BankAccountStateView | null>;

  getJournal(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<BankJournalView[]>;

  getMovements(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    type?: "DEBIT" | "CREDIT";
    fromDate?: string;
    toDate?: string;
  }): Promise<BankMovementView[]>;

  getDocuments(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
  }): Promise<BankDocumentView[]>;

  getBalances(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<BankBalanceSnapshotView[]>;
}
