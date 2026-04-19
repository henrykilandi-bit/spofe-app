// src/read-models/index.ts

export { StockProjection } from './projections/StockProjection';
export { InMemoryStockReadRepository } from './repositories/InMemoryStockReadRepository';
export type { StockReadRepository } from './ports/StockReadRepository';
export type {
  StockMovementRM,
  StockQuantityRM,
} from './types';
