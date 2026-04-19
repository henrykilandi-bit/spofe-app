import { InvestisseursGuardian } from "../../guardian/InvestisseursGuardian";
import { AttachGovernanceDocumentCommand } from "../commands/AttachGovernanceDocumentCommand";
import { EventBus } from "../EventBus";

export class AttachGovernanceDocumentHandler {
  constructor(
    private readonly guardian: InvestisseursGuardian<AttachGovernanceDocumentCommand>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: AttachGovernanceDocumentCommand): Promise<void> {
    this.guardian.validate(command);

    await this.eventBus.publish({
      type: "GovernanceDocumentAttached",
      tenantId: command.tenantId,
      documentId: command.documentId,
      documentType: command.documentType,
      documentStatus: command.documentStatus,
      occurredAt: new Date().toISOString(),
    });
  }
}
