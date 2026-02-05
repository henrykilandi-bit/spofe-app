// src/application/handlers/ReviseCostStructureHandler.ts

import { CostStructureGuardian } from '../../guardian/CostStructureGuardian';
import { ReviseCostStructureCommand } from '../commands/ReviseCostStructureCommand';
import { CostStructureRevised } from '../events/CostStructureRevised';
import { CostComputed } from '../events/CostComputed';
import { CostStructureCalculator } from '../../guardian/CostStructureCalculator';

export class ReviseCostStructureHandler {
  constructor(
    private readonly guardian: CostStructureGuardian
  ) {}

  handle(
    cmd: ReviseCostStructureCommand
  ): Array<CostStructureRevised | CostComputed> {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'REVISE',
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

    const events: Array<CostStructureRevised | CostComputed> = [];

    events.push({
      type: 'CostStructureRevised',
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
