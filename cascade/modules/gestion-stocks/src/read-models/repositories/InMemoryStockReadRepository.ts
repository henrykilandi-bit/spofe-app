// src/read-models/repositories/InMemoryStockReadRepository.ts

import { StockReadRepository } from '../ports/StockReadRepository';
import { StockMovementRM, StockQuantityRM } from '../types';

export class InMemoryStockReadRepository
  implements StockReadRepository
{
  constructor(
    private readonly movements: StockMovementRM[],
    private readonly quantities: StockQuantityRM[]
  ) {}

  async getMovements(
    tenantId: string
  ): Promise<StockMovementRM[]> {
    return this.movements.filter(
      (m) => m.tenantId === tenantId
    );
  }

  async getStockByDepot(
    tenantId: string
  ): Promise<StockQuantityRM[]> {
    return this.quantities.filter(
      (q) => q.tenantId === tenantId
    );
  }

  async getStockByProduct(
    tenantId: string
  ): Promise<StockQuantityRM[]> {
    return this.quantities.filter(
      (q) => q.tenantId === tenantId
    );
  }

  async getStockByCategory(
    tenantId: string
  ): Promise<StockQuantityRM[]> {
    return this.quantities.filter(
      (q) => q.tenantId === tenantId
    );
  }
}
