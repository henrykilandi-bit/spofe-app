// src/application/handlers/BuildCostStructureHandler.ts

import { CostStructureGuardian } from '../../guardian/CostStructureGuardian';
import { BuildCostStructureCommand } from '../commands/BuildCostStructureCommand';
import { CostStructureBuilt } from '../events/CostStructureBuilt';
import { CostComputed } from '../events/CostComputed';
import { CostStructureCalculator } from '../../guardian/CostStructureCalculator';

export class BuildCostStructureHandler {
  constructor(
    private readonly guardian: CostStructureGuardian
  ) {}

  handle(
    cmd: BuildCostStructureCommand
  ): Array<CostStructureBuilt | CostComputed> {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'BUILD',
        tenantId: cmd.tenantId,
        level: cmd.level,
        period: cmd.period,
        sources: cmd.sources,
        allocations: cmd.allocations,
      }
    );

    const computation = CostStructureCalculator.compute(
      cmd.sources,
      cmd.allocations
    );

    const events: Array<CostStructureBuilt | CostComputed> = [];

    events.push({
      type: 'CostStructureBuilt',
      payload: {
        tenantId: cmd.tenantId,
        level: cmd.level,
        period: cmd.period,
        occurredAt: new Date().toISOString(),
      },
    });

    computation.allocated.forEach(a => {
      events.push({
        type: 'CostComputed',
        payload: {
          tenantId: cmd.tenantId,
          targetType: 'PRODUCT',
          targetId: a.targetId,
          level: cmd.level,
          period: cmd.period,
          amount: a.amount,
          occurredAt: new Date().toISOString(),
        },
      });
    });

    return events;
  }
}
