// src/api/AmortizationReadController.ts

import { ApiRequest, ApiResponse } from './types';
import { AmortizationReadRepository } from '../read-models/ports/AmortizationReadRepository';
import {
  AmortizationPlanRM,
  AmortizationScheduleRM,
  AmortizationAccumulatedRM,
  AssetNetValueRM,
  AmortizationHistoryRM,
} from '../read-models/types';

export class AmortizationReadController {
  constructor(
    private readonly repo: AmortizationReadRepository
  ) {}

  async getPlans(
    req: ApiRequest
  ): Promise<ApiResponse<AmortizationPlanRM[]>> {
    const data = await this.repo.getPlans(req.tenantId);
    return { status: 200, body: data };
  }

  async getSchedule(
    req: ApiRequest
  ): Promise<ApiResponse<AmortizationScheduleRM[]>> {
    const data = await this.repo.getSchedule(req.tenantId);
    return { status: 200, body: data };
  }

  async getAccumulated(
    req: ApiRequest
  ): Promise<ApiResponse<AmortizationAccumulatedRM[]>> {
    const data = await this.repo.getAccumulated(req.tenantId);
    return { status: 200, body: data };
  }

  async getNetValues(
    req: ApiRequest
  ): Promise<ApiResponse<AssetNetValueRM[]>> {
    const data = await this.repo.getNetValues(req.tenantId);
    return { status: 200, body: data };
  }

  async getHistory(
    req: ApiRequest
  ): Promise<ApiResponse<AmortizationHistoryRM[]>> {
    const data = await this.repo.getHistory(req.tenantId);
    return { status: 200, body: data };
  }
}
