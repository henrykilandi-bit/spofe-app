// src/application/events/BudgetClosed.ts

export interface BudgetClosed {
  type: 'BudgetClosed';
  payload: {
    tenantId: string;
    budgetId: string;
    occurredAt: string;
  };
}
