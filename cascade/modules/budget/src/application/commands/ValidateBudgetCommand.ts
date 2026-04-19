// src/application/commands/ValidateBudgetCommand.ts

export interface ValidateBudgetCommand {
  commandId: string;
  tenantId: string;
  actorId: string;

  budgetId: string;
  currentStatus: 'DRAFT';
}
