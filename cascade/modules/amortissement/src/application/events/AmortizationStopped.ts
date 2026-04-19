// src/application/events/AmortizationStopped.ts

export interface AmortizationStopped {
  type: 'AmortizationStopped';
  payload: {
    tenantId: string;
    assetId: string;
    occurredAt: string;
  };
}
