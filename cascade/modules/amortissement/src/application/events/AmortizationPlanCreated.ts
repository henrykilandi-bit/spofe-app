// src/application/events/AmortizationPlanCreated.ts

export interface AmortizationPlanCreated {
  type: 'AmortizationPlanCreated';
  payload: {
    tenantId: string;
    assetId: string;
    method: string;
    usefulLifeMonths: number;
    residualValue: number;
    startDate: string;
    occurredAt: string;
  };
}
