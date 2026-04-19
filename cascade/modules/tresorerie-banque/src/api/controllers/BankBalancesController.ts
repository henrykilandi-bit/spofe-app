import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankBalancesController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getBalances(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    fromDate?: string;
    toDate?: string;
  }) {
    return this.readRepo.getBalances(params);
  }
}
