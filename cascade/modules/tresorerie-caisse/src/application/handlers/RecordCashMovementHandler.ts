import { RecordCashMovementCommand } from "../commands/RecordCashMovementCommand";
import { CashRegisterRepositoryPort } from "../ports/CashRegisterRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { CashRegisterGuardian } from "../../domain/guardian/CashRegisterGuardian";

export class RecordCashMovementHandler {
  constructor(
    private readonly guardian: CashRegisterGuardian,
    private readonly repository: CashRegisterRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: RecordCashMovementCommand): Promise<void> {
    this.guardian.assertCashRegisterOpen({
      isOpen: await this.repository.isOpen(command.cashRegisterId)
    });

    this.guardian.assertValidMovement({
      type: command.movementType,
      amount: command.amount
    });

    this.guardian.assertActorIdentified({ actorId: command.actorId });
    this.guardian.assertSignedDocument({ status: "SIGNED" });

    await this.eventStore.append({
      type: "CashMovementRecorded",
      ...command,
      recordedAt: new Date()
    });
  }
}