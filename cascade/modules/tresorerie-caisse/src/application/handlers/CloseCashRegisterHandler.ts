import { CloseCashRegisterCommand } from "../commands/CloseCashRegisterCommand";
import { CashRegisterRepositoryPort } from "../ports/CashRegisterRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { CashRegisterGuardian } from "../../domain/guardian/CashRegisterGuardian";

export class CloseCashRegisterHandler {
  constructor(
    private readonly guardian: CashRegisterGuardian,
    private readonly repository: CashRegisterRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: CloseCashRegisterCommand): Promise<void> {
    this.guardian.assertCashRegisterOpen({
      isOpen: await this.repository.isOpen(command.cashRegisterId)
    });

    this.guardian.assertPeriodNotLocked({
      locked: await this.repository.isPeriodLocked(command.cashRegisterId)
    });

    this.guardian.assertActorIdentified({ actorId: command.actorId });
    this.guardian.assertSignedDocument({ status: "SIGNED" });

    await this.eventStore.append({
      type: "CashRegisterClosed",
      ...command,
      closedAt: new Date()
    });

    if (command.theoreticalAmount !== command.realAmount) {
      await this.eventStore.append({
        type: "CashDiscrepancyRecorded",
        tenantId: command.tenantId,
        actorId: command.actorId,
        cashRegisterId: command.cashRegisterId,
        discrepancyAmount: command.realAmount - command.theoreticalAmount,
        documentId: command.documentId,
        recordedAt: new Date()
      });
    }
  }
}