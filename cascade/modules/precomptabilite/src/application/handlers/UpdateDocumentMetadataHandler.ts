import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { UpdateDocumentMetadataCommand } from '../commands/UpdateDocumentMetadataCommand';
import { DocumentMetadataUpdated } from '../events/DocumentMetadataUpdated';

export class UpdateDocumentMetadataHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: UpdateDocumentMetadataCommand): DocumentMetadataUpdated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'UPDATE_METADATA',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        metadata: cmd.metadata,
        analytics: cmd.analytics,
      }
    );

    return {
      type: 'DocumentMetadataUpdated',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        metadata: cmd.metadata,
        analytics: cmd.analytics,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
