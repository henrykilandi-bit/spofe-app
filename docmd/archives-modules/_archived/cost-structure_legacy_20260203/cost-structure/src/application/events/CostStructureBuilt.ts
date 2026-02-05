// src/application/events/CostStructureBuilt.ts

export interface CostStructureBuilt {
  type: 'CostStructureBuilt';
  payload: {
    tenantId: string;
    level: string;
    period: string;
    occurredAt: string;
  };
}
