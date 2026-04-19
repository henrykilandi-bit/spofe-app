// src/api/PrecomptabiliteReadController.ts

import { ApiRequest, ApiResponse } from './types';
import { PrecomptabiliteReadRepository } from '../read-models/ports/PrecomptabiliteReadRepository';

import {
  PreAccountingDocumentRM,
  PreAccountingStatusRM,
  PreAccountingAnalyticsRM,
  PreAccountingExposureRM,
} from '../read-models/types';

export class PrecomptabiliteReadController {
  constructor(
    private readonly repo: PrecomptabiliteReadRepository
  ) {}

  async getDocuments(
    req: ApiRequest
  ): Promise<ApiResponse<PreAccountingDocumentRM[]>> {
    const data = await this.repo.getDocuments(req.tenantId);
    return { status: 200, body: data };
  }

  async getStatuses(
    req: ApiRequest
  ): Promise<ApiResponse<PreAccountingStatusRM[]>> {
    const data = await this.repo.getStatuses(req.tenantId);
    return { status: 200, body: data };
  }

  async getAnalytics(
    req: ApiRequest
  ): Promise<ApiResponse<PreAccountingAnalyticsRM[]>> {
    const data = await this.repo.getAnalytics(req.tenantId);
    return { status: 200, body: data };
  }

  async getExposure(
    req: ApiRequest
  ): Promise<ApiResponse<PreAccountingExposureRM[]>> {
    const data = await this.repo.getExposure(req.tenantId);
    return { status: 200, body: data };
  }
}
