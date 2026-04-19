import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { CreateDocumentCommand } from '../commands/CreateDocumentCommand';
import { DocumentCreated } from '../events/DocumentCreated';

export class CreateDocumentHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: CreateDocumentCommand): DocumentCreated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'CREATE_DOCUMENT',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        documentType: cmd.documentType,
      }
    );

    return {
      type: 'DocumentCreated',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        documentType: cmd.documentType,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
