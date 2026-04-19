// src/application/events/BudgetUpdated.ts

export interface BudgetUpdated {
  type: 'BudgetUpdated';
  payload: {
    tenantId: string;
    budgetId: string;
    occurredAt: string;
  };
}
