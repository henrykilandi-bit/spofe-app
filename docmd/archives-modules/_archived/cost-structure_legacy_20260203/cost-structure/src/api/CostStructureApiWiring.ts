// src/api/CostStructureApiWiring.ts

import { CostStructureReadController } from './CostStructureReadController';
import { CostStructureProjection } from '../read-models/projections/CostStructureProjection';
import { InMemoryCostStructureReadRepository } from '../read-models/repositories/InMemoryCostStructureReadRepository';

export function createCostStructureReadApi(
  events: any[]
): CostStructureReadController {
  const projection = new CostStructureProjection();

  for (const event of events) {
    projection.apply(event);
  }

  const repo = new InMemoryCostStructureReadRepository(
    projection.snapshotByProduct(),
    projection.snapshotByActivity(),
    projection.snapshotByPeriod(),
    projection.snapshotBreakdown(),
    projection.snapshotScenarios()
  );

  return new CostStructureReadController(repo);
}
