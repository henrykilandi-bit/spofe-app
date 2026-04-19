// src/application/handlers/CreateAmortizationPlanHandler.ts

import { AmortizationGuardian } from '../../guardian/AmortizationGuardian';
import { CreateAmortizationPlanCommand } from '../commands/CreateAmortizationPlanCommand';
import { AmortizationPlanCreated } from '../events/AmortizationPlanCreated';

export class CreateAmortizationPlanHandler {
  constructor(
    private readonly guardian: AmortizationGuardian
  ) {}

  handle(cmd: CreateAmortizationPlanCommand): AmortizationPlanCreated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'CREATE_PLAN',
        tenantId: cmd.tenantId,
        asset: cmd.asset,
        method: cmd.method,
        effectiveDate: cmd.effectiveDate,
      }
    );

    return {
      type: 'AmortizationPlanCreated',
      payload: {
        tenantId: cmd.tenantId,
        assetId: cmd.asset.assetId,
        method: cmd.method,
        usefulLifeMonths: cmd.asset.usefulLifeMonths,
        residualValue: cmd.asset.residualValue,
        startDate: cmd.effectiveDate,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
