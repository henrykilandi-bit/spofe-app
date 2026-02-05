// src/guardian/types.ts

export type CostLevel = 'N1' | 'N2' | 'N3';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface CostSource {
  sourceType: 'STOCK' | 'AMORTIZATION';
  sourceId: string;
  quantity?: number;
  unitCost?: number;
  amount?: number;
}

export interface AllocationKey {
  targetType: 'PRODUCT' | 'ACTIVITY' | 'PROJECT';
  targetId: string;
  ratio: number; // 0..1
}

export interface BuildCostStructureCommand {
  commandId: string;
  commandType: 'BUILD' | 'REVISE';
  tenantId: string;
  level: CostLevel;
  period: string; // YYYY-MM
  sources: CostSource[];
  allocations: AllocationKey[];
}
