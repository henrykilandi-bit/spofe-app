import { RecordBankDebitCommand } from "../commands/RecordBankDebitCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";

export class RecordBankDebitHandler {
  constructor(
    private readonly guardian: BankGuardian,
    private readonly repository: BankRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RecordBankDebitCommand): Promise<void> {
    if (!command.externalReference?.trim()) {
      throw new Error("G13_VIOLATION: externalReference is required");
    }

    this.guardian.assertBankAccountExists({
      exists: await this.repository.bankAccountExists(command.bankAccountId)
    });

    this.guardian.assertFactIsObserved({ observed: true });
    this.guardian.assertSingleBankAccount({ single: true });
    this.guardian.assertBankDateValid({ valid: true });
    this.guardian.assertExternalReferenceUnique({
      unique: !(
        await this.repository.movementExternalReferenceExists(
          command.bankAccountId,
          command.externalReference
        )
      )
    });

    await this.eventStore.append({
      type: "BankDebitRecorded",
      ...command,
      recordedAt: new Date().toISOString()
    });
  }
}
