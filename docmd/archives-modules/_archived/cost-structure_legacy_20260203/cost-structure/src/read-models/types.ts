// src/read-models/types.ts

export type CostLevel = 'N1' | 'N2' | 'N3';

export interface CostByProductRM {
  tenantId: string;
  productId: string;
  level: CostLevel;
  period: string; // YYYY-MM
  amount: number;
}

export interface CostByActivityRM {
  tenantId: string;
  activityId: string;
  level: CostLevel;
  period: string;
  amount: number;
}

export interface CostByPeriodRM {
  tenantId: string;
  level: CostLevel;
  period: string;
  totalAmount: number;
}

export interface CostBreakdownRM {
  tenantId: string;
  level: CostLevel;
  period: string;
  sourceType: 'STOCK' | 'AMORTIZATION';
  sourceId: string;
  amount: number;
}

export interface CostScenarioRM {
  tenantId: string;
  level: CostLevel;
  period: string;
  scenario: 'S70' | 'S100' | 'S130';
  amount: number;
}
