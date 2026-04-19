import { RecordCashDiscrepancyCommand } from "../commands/RecordCashDiscrepancyCommand";
import { EventStorePort } from "../ports/EventStorePort";
import { CashRegisterGuardian } from "../../domain/guardian/CashRegisterGuardian";

export class RecordCashDiscrepancyHandler {
  constructor(
    private readonly guardian: CashRegisterGuardian,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RecordCashDiscrepancyCommand): Promise<void> {
    this.guardian.assertDiscrepancyAtClosure({ atClosure: true });
    this.guardian.assertActorIdentified({ actorId: command.actorId });

    await this.eventStore.append({
      type: "CashDiscrepancyRecorded",
      ...command,
      recordedAt: new Date()
    });
  }
}