import { RegisterBankAccountCommand } from "../commands/RegisterBankAccountCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";

export class RegisterBankAccountHandler {
  constructor(
    private readonly guardian: BankGuardian,
    private readonly repository: BankRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RegisterBankAccountCommand): Promise<void> {
    this.guardian.assertBankExists({
      exists: await this.repository.bankExists(command.bankId)
    });

    this.guardian.assertTenantIsolation({ valid: true });

    await this.eventStore.append({
      type: "BankAccountRegistered",
      ...command,
      registeredAt: new Date().toISOString()
    });
  }
}
