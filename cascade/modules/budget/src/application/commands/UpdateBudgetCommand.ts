// src/application/commands/UpdateBudgetCommand.ts

import {
  BudgetHypothesis,
  BudgetLine,
} from '../../guardian/types';

export interface UpdateBudgetCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  budgetId: string;

  hypotheses?: BudgetHypothesis[];
  lines?: BudgetLine[];
}
