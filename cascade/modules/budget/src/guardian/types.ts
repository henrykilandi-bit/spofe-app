// src/guardian/types.ts

export type BudgetType = 'OBJECTIVE' | 'CASHFLOW';
export type BudgetStatus = 'DRAFT' | 'VALIDATED' | 'CLOSED';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface BudgetHypothesis {
  key: string;            // ex: "volume_forecast", "sales_forecast"
  description: string;
  value: number;
  sourceModule?: 'COST_STRUCTURE' | 'AMORTIZATION' | 'STOCK' | 'SALES';
}

export interface BudgetLine {
  targetType: 'PRODUCT' | 'ACTIVITY' | 'CATEGORY';
  targetId: string;
  period: string;         // YYYY-MM
  amount: number;         // prévision, pas un coût
}

export interface BudgetCommand {
  commandId: string;
  commandType: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'CLOSE';
  tenantId: string;

  budgetId: string;
  budgetType?: BudgetType;
  status?: BudgetStatus;

  periodFrom?: string;     // YYYY-MM
  periodTo?: string;       // YYYY-MM

  hypotheses?: BudgetHypothesis[];
  lines?: BudgetLine[];
}
