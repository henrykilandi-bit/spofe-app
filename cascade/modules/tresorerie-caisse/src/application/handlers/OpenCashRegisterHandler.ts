import { OpenCashRegisterCommand } from "../commands/OpenCashRegisterCommand";
import { CashRegisterRepositoryPort } from "../ports/CashRegisterRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { CashRegisterGuardian } from "../../domain/guardian/CashRegisterGuardian";

export class OpenCashRegisterHandler {
  constructor(
    private readonly guardian: CashRegisterGuardian,
    private readonly repository: CashRegisterRepositoryPort,
    private readonly eventStore: EventStorePort
  ) {}

  async execute(command: OpenCashRegisterCommand): Promise<void> {
    this.guardian.assertCashRegisterExists({
      exists: await this.repository.exists(command.cashRegisterId)
    });

    this.guardian.assertNoActiveOpening({
      hasActiveOpening: await this.repository.hasActiveOpening(command.cashRegisterId)
    });

    this.guardian.assertActorIdentified({ actorId: command.actorId });
    this.guardian.assertSignedDocument({ status: "SIGNED" });

    await this.eventStore.append({
      type: "CashRegisterOpened",
      ...command,
      openedAt: new Date()
    });
  }
}