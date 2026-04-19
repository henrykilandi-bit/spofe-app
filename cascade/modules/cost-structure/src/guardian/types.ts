/**
 * SPOFE Cost-Structure Module Guardian
 * Invariants de protection des structures de coûts
 */

export interface CostAllocation {
  targetType: 'PRODUCT' | 'ACTIVITY' | 'CENTER';
  targetId: string;
  ratio: number; // 0.0 to 1.0
}

export interface CostSource {
  sourceType: 'STOCK' | 'AMORTIZATION' | 'LABOR' | 'OVERHEAD';
  sourceId: string;
  amount?: number;
  quantity?: number;
  unitCost?: number;
}

export interface CostStructureData {
  tenantId: string;
  projectId: string;
  level: string;
  period: string;
  sources: CostSource[];
  allocations: CostAllocation[];
}

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export class GuardianError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianError';
  }
}