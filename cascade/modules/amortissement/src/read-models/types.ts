// src/read-models/types.ts

export interface AmortizationPlanRM {
  tenantId: string;
  assetId: string;
  method: string;
  usefulLifeMonths: number;
  residualValue: number;
  startDate: string;
  status: 'ACTIVE' | 'STOPPED';
}

export interface AmortizationScheduleRM {
  tenantId: string;
  assetId: string;
  period: string; // YYYY-MM
  dotation: number;
}

export interface AmortizationAccumulatedRM {
  tenantId: string;
  assetId: string;
  accumulated: number;
}

export interface AssetNetValueRM {
  tenantId: string;
  assetId: string;
  netValue: number;
}

export interface AmortizationHistoryRM {
  tenantId: string;
  assetId: string;
  eventType: string;
  occurredAt: string;
}
