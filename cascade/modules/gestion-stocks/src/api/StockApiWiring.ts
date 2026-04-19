// src/api/StockApiWiring.ts

import { StockReadController } from './StockReadController';
import { StockProjection } from '../read-models/projections/StockProjection';
import { InMemoryStockReadRepository } from '../read-models/repositories/InMemoryStockReadRepository';

export function createStockReadApi(
  events: any[]
): StockReadController {
  const projection = new StockProjection();

  for (const event of events) {
    projection.apply(event);
  }

  const repo = new InMemoryStockReadRepository(
    projection.snapshotMovements(),
    projection.snapshotQuantities()
  );

  return new StockReadController(repo);
}
