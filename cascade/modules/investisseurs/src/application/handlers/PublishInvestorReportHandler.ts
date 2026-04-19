import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { PublishInvestorReportCommand } from "../commands/PublishInvestorReportCommand";
import { EventBus } from "../EventBus";

export class PublishInvestorReportHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<PublishInvestorReportCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: PublishInvestorReportCommand): Promise<void> {
    this.guardian.validate(command);

    await this.eventBus.publish({
      type: "InvestorReportPublished",
      tenantId: command.tenantId,
      reportId: command.reportId,
      period: command.period,
      documentStatus: command.documentStatus,
      occurredAt: new Date().toISOString(),
    });
  }
}
