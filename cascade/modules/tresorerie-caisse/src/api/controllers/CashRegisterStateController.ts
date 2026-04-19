import { CashReadRepositoryPort } from "../../application/ports/CashReadRepositoryPort";

export class CashRegisterStateController {
  constructor(private readonly readRepo: CashReadRepositoryPort) {}

  async getState(cashRegisterId: string) {
    return this.readRepo.getState(cashRegisterId);
  }
}