import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { RejectDocumentCommand } from '../commands/RejectDocumentCommand';
import { DocumentRejected } from '../events/DocumentRejected';

export class RejectDocumentHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: RejectDocumentCommand): DocumentRejected {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'REJECT_DOCUMENT',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'DocumentRejected',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        reason: cmd.reason,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
