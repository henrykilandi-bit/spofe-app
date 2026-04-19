import { CashReadRepositoryPort } from "../../application/ports/CashReadRepositoryPort";

export class CashDiscrepancyController {
  constructor(private readonly readRepo: CashReadRepositoryPort) {}

  async getDiscrepancies(query: any) {
    return this.readRepo.getDiscrepancies(query);
  }
}