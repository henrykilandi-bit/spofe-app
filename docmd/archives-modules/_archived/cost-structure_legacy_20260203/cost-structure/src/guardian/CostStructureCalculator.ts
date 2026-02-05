// src/guardian/CostStructureCalculator.ts

import { CostSource, AllocationKey } from './types';

export interface CostComputationResult {
  totalCost: number;
  allocated: Array<{
    targetId: string;
    amount: number;
  }>;
}

export class CostStructureCalculator {
  static compute(
    sources: CostSource[],
    allocations: AllocationKey[]
  ): CostComputationResult {
    const total = sources.reduce((sum, s) => {
      if (s.amount !== undefined) return sum + s.amount;
      if (s.quantity !== undefined && s.unitCost !== undefined) {
        return sum + s.quantity * s.unitCost;
      }
      return sum;
    }, 0);

    const allocated = allocations.map(a => ({
      targetId: a.targetId,
      amount: total * a.ratio,
    }));

    return { totalCost: total, allocated };
  }
}
