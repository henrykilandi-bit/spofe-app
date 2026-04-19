import { CashReadRepositoryPort } from "../../application/ports/CashReadRepositoryPort";

export class CashMovementController {
  constructor(private readonly readRepo: CashReadRepositoryPort) {}

  async getMovements(query: any) {
    return this.readRepo.getMovements(query);
  }
}