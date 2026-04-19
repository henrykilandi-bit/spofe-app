// src/application/handlers/StopAmortizationHandler.ts

import { AmortizationGuardian } from '../../guardian/AmortizationGuardian';
import { StopAmortizationCommand } from '../commands/StopAmortizationCommand';
import { AmortizationStopped } from '../events/AmortizationStopped';

export class StopAmortizationHandler {
  constructor(
    private readonly guardian: AmortizationGuardian
  ) {}

  handle(cmd: StopAmortizationCommand): AmortizationStopped {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'STOP_PLAN',
        tenantId: cmd.tenantId,
        asset: {
          assetId: cmd.assetId,
          tenantId: cmd.tenantId,
          acquisitionValue: 1,
          inServiceDate: '',
          usefulLifeMonths: 1,
          residualValue: 0,
        },
        method: 'LINEAR',
        effectiveDate: cmd.effectiveDate,
      }
    );

    return {
      type: 'AmortizationStopped',
      payload: {
        tenantId: cmd.tenantId,
        assetId: cmd.assetId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
