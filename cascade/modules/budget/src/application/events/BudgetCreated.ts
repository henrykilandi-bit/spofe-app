// src/application/events/BudgetCreated.ts

export interface BudgetCreated {
  type: 'BudgetCreated';
  payload: {
    tenantId: string;
    budgetId: string;
    budgetType: string;
    periodFrom: string;
    periodTo: string;
    lines: Array<{
      targetType: 'PRODUCT' | 'ACTIVITY' | 'CATEGORY';
      targetId: string;
      period: string;
      amount: number;
    }>;
    occurredAt: string;
  };
}
