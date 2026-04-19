// src/api/StockReadController.ts

import { ApiRequest, ApiResponse } from './types';
import { StockReadRepository } from '../read-models/ports/StockReadRepository';
import {
  StockMovementRM,
  StockQuantityRM,
} from '../read-models/types';

export class StockReadController {
  constructor(
    private readonly repo: StockReadRepository
  ) {}

  async getMovements(
    req: ApiRequest
  ): Promise<ApiResponse<StockMovementRM[]>> {
    const data = await this.repo.getMovements(req.tenantId);
    return { status: 200, body: data };
  }

  async getStockByDepot(
    req: ApiRequest
  ): Promise<ApiResponse<StockQuantityRM[]>> {
    const data = await this.repo.getStockByDepot(req.tenantId);
    return { status: 200, body: data };
  }

  async getStockByProduct(
    req: ApiRequest
  ): Promise<ApiResponse<StockQuantityRM[]>> {
    const data = await this.repo.getStockByProduct(req.tenantId);
    return { status: 200, body: data };
  }

  async getStockByCategory(
    req: ApiRequest
  ): Promise<ApiResponse<StockQuantityRM[]>> {
    const data = await this.repo.getStockByCategory(req.tenantId);
    return { status: 200, body: data };
  }
}
