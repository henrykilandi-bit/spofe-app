import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankJournalController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getJournal(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
    fromDate?: string;
    toDate?: string;
  }) {
    return this.readRepo.getJournal(params);
  }
}
