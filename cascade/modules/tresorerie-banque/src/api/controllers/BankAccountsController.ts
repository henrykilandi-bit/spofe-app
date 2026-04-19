import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankAccountsController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getAccounts(query: {
    tenantId: string;
    bankId?: string;
    status?: "ACTIVE" | "INACTIVE";
  }) {
    return this.readRepo.getAccounts(query);
  }
}
