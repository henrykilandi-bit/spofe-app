export interface BankAccountStateView {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  lastBankDate?: string;
  lastBalance?: number;
}
