import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankMovementsController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getMovements(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    type?: "DEBIT" | "CREDIT";
    fromDate?: string;
    toDate?: string;
  }) {
    return this.readRepo.getMovements(params);
  }
}
