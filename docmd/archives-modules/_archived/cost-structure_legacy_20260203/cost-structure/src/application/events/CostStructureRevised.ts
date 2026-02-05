// src/application/events/CostStructureRevised.ts

export interface CostStructureRevised {
  type: 'CostStructureRevised';
  payload: {
    tenantId: string;
    level: string;
    period: string;
    occurredAt: string;
  };
}
