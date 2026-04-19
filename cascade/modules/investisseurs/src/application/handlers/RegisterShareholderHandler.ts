import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { RegisterShareholderCommand } from "../commands/RegisterShareholderCommand";
import { EventBus } from "../EventBus";

export class RegisterShareholderHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<RegisterShareholderCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RegisterShareholderCommand): Promise<void> {
    // 1. Guardian validation (BLOQUANT)
    this.guardian.validate(command);

    // 2. Event creation (append-only)
    const event = {
      type: "ShareholderRegistered",
      tenantId: command.tenantId,
      shareholderId: command.shareholderId,
      name: command.name,
      shares: command.shares,
      percentage: command.percentage,
      occurredAt: new Date().toISOString(),
    };

    // 3. Publish
    await this.eventBus.publish(event);
  }
}
