import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankAccountStateController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getState(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
  }) {
    return this.readRepo.getAccountState(params);
  }
}
