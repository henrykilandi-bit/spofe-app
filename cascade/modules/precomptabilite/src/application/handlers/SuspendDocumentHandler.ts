import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { SuspendDocumentCommand } from '../commands/SuspendDocumentCommand';
import { DocumentSuspended } from '../events/DocumentSuspended';

export class SuspendDocumentHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: SuspendDocumentCommand): DocumentSuspended {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'SUSPEND_DOCUMENT',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'DocumentSuspended',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        reason: cmd.reason,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
