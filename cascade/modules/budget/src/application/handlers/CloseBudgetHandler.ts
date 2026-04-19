// src/application/handlers/CloseBudgetHandler.ts

import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { CloseBudgetCommand } from '../commands/CloseBudgetCommand';
import { BudgetClosed } from '../events/BudgetClosed';

export class CloseBudgetHandler {
  constructor(
    private readonly guardian: BudgetGuardian
  ) {}

  handle(cmd: CloseBudgetCommand): BudgetClosed {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'CLOSE',
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'BudgetClosed',
      payload: {
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
