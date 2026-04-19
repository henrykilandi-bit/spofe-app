// src/api/BudgetApiWiring.ts

import { BudgetReadController } from './BudgetReadController';
import { BudgetProjection } from '../read-models/projections/BudgetProjection';
import { InMemoryBudgetReadRepository } from '../read-models/repositories/InMemoryBudgetReadRepository';

export function createBudgetReadApi(
  events: any[]
): BudgetReadController {
  const projection = new BudgetProjection();

  for (const event of events) {
    projection.apply(event);
  }

  const repo = new InMemoryBudgetReadRepository(
    projection.snapshotObjectives(),
    projection.snapshotCashflows(),
    projection.snapshotVariances(),
    projection.snapshotTimelines(),
    projection.snapshotAlerts()
  );

  return new BudgetReadController(repo);
}
