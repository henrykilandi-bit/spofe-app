// src/application/handlers/ReviseAmortizationPlanHandler.ts

import { AmortizationGuardian } from '../../guardian/AmortizationGuardian';
import { ReviseAmortizationPlanCommand } from '../commands/ReviseAmortizationPlanCommand';
import { AmortizationPlanRevised } from '../events/AmortizationPlanRevised';

export class ReviseAmortizationPlanHandler {
  constructor(
    private readonly guardian: AmortizationGuardian
  ) {}

  handle(cmd: ReviseAmortizationPlanCommand): AmortizationPlanRevised {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'REVISE_PLAN',
        tenantId: cmd.tenantId,
        asset: {
          assetId: cmd.assetId,
          tenantId: cmd.tenantId,
          acquisitionValue: 1, // valeur placeholder validée en amont
          inServiceDate: '',
          usefulLifeMonths: cmd.revision.usefulLifeMonths ?? 1,
          residualValue: cmd.revision.residualValue ?? 0,
        },
        method: 'LINEAR',
        revision: cmd.revision,
        effectiveDate: cmd.effectiveDate,
      }
    );

    return {
      type: 'AmortizationPlanRevised',
      payload: {
        tenantId: cmd.tenantId,
        assetId: cmd.assetId,
        usefulLifeMonths: cmd.revision.usefulLifeMonths,
        residualValue: cmd.revision.residualValue,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
