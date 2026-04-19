export interface RegisterBankAccountCommand {
  tenantId: string;
  bankId: string;
  bankAccountId: string;
  currency: string;
  actorId: string;
}
