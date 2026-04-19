// src/application/events/BudgetValidated.ts

export interface BudgetValidated {
  type: 'BudgetValidated';
  payload: {
    tenantId: string;
    budgetId: string;
    occurredAt: string;
  };
}
