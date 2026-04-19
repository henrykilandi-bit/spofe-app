import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";

export class BankDocumentsController {
  constructor(private readonly readRepo: BankReadRepositoryPort) {}

  async getDocuments(params: {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
  }) {
    return this.readRepo.getDocuments(params);
  }
}
