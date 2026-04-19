import { RecordBankBalanceSnapshotCommand } from "../commands/RecordBankBalanceSnapshotCommand";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";

export class RecordBankBalanceSnapshotHandler {
  constructor(
    private readonly guardian: BankGuardian,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RecordBankBalanceSnapshotCommand): Promise<void> {
    this.guardian.assertBalanceIsFactual({ factual: true });
    this.guardian.assertBankDateValid({ valid: true });

    await this.eventStore.append({
      type: "BankBalanceSnapshotRecorded",
      ...command,
      recordedAt: new Date().toISOString()
    });
  }
}
