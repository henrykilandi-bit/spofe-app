// src/application/events/BudgetVarianceComputed.ts

export interface BudgetVarianceComputed {
  type: 'BudgetVarianceComputed';
  payload: {
    tenantId: string;
    budgetId: string;
    period: string;
    variance: number;
    occurredAt: string;
  };
}
