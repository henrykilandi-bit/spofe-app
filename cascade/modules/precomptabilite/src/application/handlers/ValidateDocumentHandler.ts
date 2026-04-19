import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { ValidateDocumentCommand } from '../commands/ValidateDocumentCommand';
import { DocumentValidated } from '../events/DocumentValidated';

export class ValidateDocumentHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: ValidateDocumentCommand): DocumentValidated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'VALIDATE_DOCUMENT',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'DocumentValidated',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
