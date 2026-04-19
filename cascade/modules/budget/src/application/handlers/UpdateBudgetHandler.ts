// src/application/handlers/UpdateBudgetHandler.ts

import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { UpdateBudgetCommand } from '../commands/UpdateBudgetCommand';
import { BudgetUpdated } from '../events/BudgetUpdated';

export class UpdateBudgetHandler {
  constructor(
    private readonly guardian: BudgetGuardian
  ) {}

  handle(cmd: UpdateBudgetCommand): BudgetUpdated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'UPDATE',
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
      }
    );

    return {
      type: 'BudgetUpdated',
      payload: {
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
