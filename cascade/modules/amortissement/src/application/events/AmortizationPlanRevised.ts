// src/application/events/AmortizationPlanRevised.ts

export interface AmortizationPlanRevised {
  type: 'AmortizationPlanRevised';
  payload: {
    tenantId: string;
    assetId: string;
    usefulLifeMonths?: number;
    residualValue?: number;
    occurredAt: string;
  };
}
