// src/application/commands/CloseBudgetCommand.ts

export interface CloseBudgetCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  budgetId: string;
  currentStatus: 'VALIDATED';
}
