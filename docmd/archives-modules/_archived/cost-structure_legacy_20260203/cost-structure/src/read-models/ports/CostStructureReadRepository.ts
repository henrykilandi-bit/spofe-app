// src/read-models/ports/CostStructureReadRepository.ts

import {
  CostByProductRM,
  CostByActivityRM,
  CostByPeriodRM,
  CostBreakdownRM,
  CostScenarioRM,
} from '../types';

export interface CostStructureReadRepository {
  getCostsByProduct(
    tenantId: string
  ): Promise<CostByProductRM[]>;

  getCostsByActivity(
    tenantId: string
  ): Promise<CostByActivityRM[]>;

  getCostsByPeriod(
    tenantId: string
  ): Promise<CostByPeriodRM[]>;

  getCostBreakdown(
    tenantId: string
  ): Promise<CostBreakdownRM[]>;

  getCostScenarios(
    tenantId: string
  ): Promise<CostScenarioRM[]>;
}
