import { PrecomptabiliteGuardian } from '../../guardian/PrecomptabiliteGuardian';
import { SubmitForValidationCommand } from '../commands/SubmitForValidationCommand';
import { DocumentSubmitted } from '../events/DocumentSubmitted';

export class SubmitForValidationHandler {
  constructor(private readonly guardian: PrecomptabiliteGuardian) {}

  handle(cmd: SubmitForValidationCommand): DocumentSubmitted {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'SUBMIT_FOR_VALIDATION',
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'DocumentSubmitted',
      payload: {
        tenantId: cmd.tenantId,
        documentId: cmd.documentId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
