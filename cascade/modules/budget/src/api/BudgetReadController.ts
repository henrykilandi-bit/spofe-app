// src/api/BudgetReadController.ts

import { ApiRequest, ApiResponse } from './types';
import { BudgetReadRepository } from '../read-models/ports/BudgetReadRepository';
import {
  BudgetObjectiveRM,
  BudgetCashflowRM,
  BudgetVarianceRM,
  BudgetTimelineRM,
  BudgetAlertRM,
} from '../read-models/types';

export class BudgetReadController {
  constructor(
    private readonly repo: BudgetReadRepository
  ) {}

  async getObjectives(
    req: ApiRequest
  ): Promise<ApiResponse<BudgetObjectiveRM[]>> {
    const data = await this.repo.getObjectives(req.tenantId);
    return { status: 200, body: data };
  }

  async getCashflows(
    req: ApiRequest
  ): Promise<ApiResponse<BudgetCashflowRM[]>> {
    const data = await this.repo.getCashflows(req.tenantId);
    return { status: 200, body: data };
  }

  async getVariances(
    req: ApiRequest
  ): Promise<ApiResponse<BudgetVarianceRM[]>> {
    const data = await this.repo.getVariances(req.tenantId);
    return { status: 200, body: data };
  }

  async getTimeline(
    req: ApiRequest
  ): Promise<ApiResponse<BudgetTimelineRM[]>> {
    const data = await this.repo.getTimeline(req.tenantId);
    return { status: 200, body: data };
  }

  async getAlerts(
    req: ApiRequest
  ): Promise<ApiResponse<BudgetAlertRM[]>> {
    const data = await this.repo.getAlerts(req.tenantId);
    return { status: 200, body: data };
  }
}
