// src/application/handlers/ValidateBudgetHandler.ts

import { BudgetGuardian } from '../../guardian/BudgetGuardian';
import { ValidateBudgetCommand } from '../commands/ValidateBudgetCommand';
import { BudgetValidated } from '../events/BudgetValidated';

export class ValidateBudgetHandler {
  constructor(
    private readonly guardian: BudgetGuardian
  ) {}

  handle(cmd: ValidateBudgetCommand): BudgetValidated {
    this.guardian.validate(
      { tenantId: cmd.tenantId, actorId: cmd.actorId },
      {
        commandId: cmd.commandId,
        commandType: 'VALIDATE',
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        status: cmd.currentStatus,
      }
    );

    return {
      type: 'BudgetValidated',
      payload: {
        tenantId: cmd.tenantId,
        budgetId: cmd.budgetId,
        occurredAt: new Date().toISOString(),
      },
    };
  }
}
