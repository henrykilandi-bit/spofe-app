import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { RevokeInvestorAccessCommand } from "../commands/RevokeInvestorAccessCommand";
import { EventBus } from "../EventBus";

export class RevokeInvestorAccessHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<RevokeInvestorAccessCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RevokeInvestorAccessCommand): Promise<void> {
    this.guardian.validate(command);

    await this.eventBus.publish({
      type: "InvestorAccessRevoked",
      tenantId: command.tenantId,
      investorId: command.investorId,
      reason: command.reason,
      occurredAt: new Date().toISOString(),
    });
  }
}
