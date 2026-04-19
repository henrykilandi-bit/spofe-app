import { CashReadRepositoryPort } from "../../application/ports/CashReadRepositoryPort";

export class CashSessionHistoryController {
  constructor(private readonly readRepo: CashReadRepositoryPort) {}

  async getSessions(query: any) {
    return this.readRepo.getSessions(query);
  }
}