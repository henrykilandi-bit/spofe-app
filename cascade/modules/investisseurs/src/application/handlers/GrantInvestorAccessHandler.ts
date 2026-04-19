import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { GrantInvestorAccessCommand } from "../commands/GrantInvestorAccessCommand";
import { EventBus } from "../EventBus";

export class GrantInvestorAccessHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<GrantInvestorAccessCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: GrantInvestorAccessCommand): Promise<void> {
    this.guardian.validate(command);

    await this.eventBus.publish({
      type: "InvestorAccessGranted",
      tenantId: command.tenantId,
      investorId: command.investorId,
      scope: command.scope,
      occurredAt: new Date().toISOString(),
    });
  }
}
