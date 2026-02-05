// src/read-models/repositories/InMemoryCostStructureReadRepository.ts

import { CostStructureReadRepository } from '../ports/CostStructureReadRepository';
import {
  CostByProductRM,
  CostByActivityRM,
  CostByPeriodRM,
  CostBreakdownRM,
  CostScenarioRM,
} from '../types';

export class InMemoryCostStructureReadRepository
  implements CostStructureReadRepository
{
  constructor(
    private readonly byProduct: CostByProductRM[],
    private readonly byActivity: CostByActivityRM[],
    private readonly byPeriod: CostByPeriodRM[],
    private readonly breakdown: CostBreakdownRM[],
    private readonly scenarios: CostScenarioRM[]
  ) {}

  async getCostsByProduct(
    tenantId: string
  ): Promise<CostByProductRM[]> {
    return this.byProduct.filter(p => p.tenantId === tenantId);
  }

  async getCostsByActivity(
    tenantId: string
  ): Promise<CostByActivityRM[]> {
    return this.byActivity.filter(a => a.tenantId === tenantId);
  }

  async getCostsByPeriod(
    tenantId: string
  ): Promise<CostByPeriodRM[]> {
    return this.byPeriod.filter(p => p.tenantId === tenantId);
  }

  async getCostBreakdown(
    tenantId: string
  ): Promise<CostBreakdownRM[]> {
    return this.breakdown.filter(b => b.tenantId === tenantId);
  }

  async getCostScenarios(
    tenantId: string
  ): Promise<CostScenarioRM[]> {
    return this.scenarios.filter(s => s.tenantId === tenantId);
  }
}
