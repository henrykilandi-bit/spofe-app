// src/api/CostStructureReadController.ts

import { ApiRequest, ApiResponse } from './types';
import { CostStructureReadRepository } from '../read-models/ports/CostStructureReadRepository';
import {
  CostByProductRM,
  CostByActivityRM,
  CostByPeriodRM,
  CostBreakdownRM,
  CostScenarioRM,
} from '../read-models/types';

export class CostStructureReadController {
  constructor(
    private readonly repo: CostStructureReadRepository
  ) {}

  async getCostsByProduct(
    req: ApiRequest
  ): Promise<ApiResponse<CostByProductRM[]>> {
    const data = await this.repo.getCostsByProduct(req.tenantId);
    return { status: 200, body: data };
  }

  async getCostsByActivity(
    req: ApiRequest
  ): Promise<ApiResponse<CostByActivityRM[]>> {
    const data = await this.repo.getCostsByActivity(req.tenantId);
    return { status: 200, body: data };
  }

  async getCostsByPeriod(
    req: ApiRequest
  ): Promise<ApiResponse<CostByPeriodRM[]>> {
    const data = await this.repo.getCostsByPeriod(req.tenantId);
    return { status: 200, body: data };
  }

  async getCostBreakdown(
    req: ApiRequest
  ): Promise<ApiResponse<CostBreakdownRM[]>> {
    const data = await this.repo.getCostBreakdown(req.tenantId);
    return { status: 200, body: data };
  }

  async getCostScenarios(
    req: ApiRequest
  ): Promise<ApiResponse<CostScenarioRM[]>> {
    const data = await this.repo.getCostScenarios(req.tenantId);
    return { status: 200, body: data };
  }
}
