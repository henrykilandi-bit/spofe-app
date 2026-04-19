import { CashReadRepositoryPort } from "../../application/ports/CashReadRepositoryPort";

export class CashJournalController {
  constructor(private readonly readRepo: CashReadRepositoryPort) {}

  async getJournal(query: any) {
    return this.readRepo.getJournal(query);
  }
}