import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { RecordCapitalOperationCommand } from "../commands/RecordCapitalOperationCommand";
import { EventBus } from "../EventBus";

export class RecordCapitalOperationHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<RecordCapitalOperationCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RecordCapitalOperationCommand): Promise<void> {
    this.guardian.validate(command);

    await this.eventBus.publish({
      type: "CapitalOperationRecorded",
      tenantId: command.tenantId,
      operationType: command.operationType,
      reference: command.reference,
      occurredAt: new Date().toISOString(),
    });
  }
}
