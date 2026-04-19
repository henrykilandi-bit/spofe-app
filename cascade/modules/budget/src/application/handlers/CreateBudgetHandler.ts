// src/application/handlers/CreateBudgetHandler.ts

import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { CreateBudgetCommand } from '../commands/CreateBudgetCommand';
import { BudgetCreated } from '../events/BudgetCreated';

export class CreateBudgetHandler {
  constructor(
    private readonly guardian: BudgetGuardian
  ) {}

  handle(cmd: CreateBudgetCommand): BudgetCreated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'CREATE',
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        budgetType: cmd.budgetType,
        status: 'DRAFT',
        periodFrom: cmd.periodFrom,
        periodTo: cmd.periodTo,
        hypotheses: cmd.hypotheses,
        lines: cmd.lines,
      }
    );

    return {
      type: 'BudgetCreated',
      payload: {
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        budgetType: cmd.budgetType,
        periodFrom: cmd.periodFrom,
        periodTo: cmd.periodTo,
        lines: cmd.lines.map((line) => ({
          targetType: line.targetType,
          targetId: line.targetId,
          period: line.period,
          amount: line.amount,
        })),
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
