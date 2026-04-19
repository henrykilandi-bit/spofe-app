// src/application/events/AmortizationAccrued.ts

export interface AmortizationAccrued {
  type: 'AmortizationAccrued';
  payload: {
    tenantId: string;
    assetId: string;
    period: string; // YYYY-MM
    dotation: number;
    occurredAt: string;
  };
}
