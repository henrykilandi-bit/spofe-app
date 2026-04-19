import { RegisterBankDocumentCommand } from "../commands/RegisterBankDocumentCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";

export class RegisterBankDocumentHandler {
  constructor(
    private readonly guardian: BankGuardian,
    private readonly repository: BankRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RegisterBankDocumentCommand): Promise<void> {
    this.guardian.assertBankAccountExists({
      exists: await this.repository.bankAccountExists(command.bankAccountId)
    });

    this.guardian.assertBankDocumentValid({ valid: true });
    this.guardian.assertDocumentImmutable({ immutable: true });

    await this.eventStore.append({
      type: "BankDocumentRegistered",
      ...command,
      registeredAt: new Date().toISOString()
    });
  }
}
