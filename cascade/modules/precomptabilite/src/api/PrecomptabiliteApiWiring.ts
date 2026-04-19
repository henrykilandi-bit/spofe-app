// src/api/PrecomptabiliteApiWiring.ts

import { PrecomptabiliteReadController } from './PrecomptabiliteReadController';
import { PrecomptabiliteProjection } from '../read-models/projections/PrecomptabiliteProjection';
import { InMemoryPrecomptabiliteReadRepository } from '../read-models/repositories/InMemoryPrecomptabiliteReadRepository';

export function createPrecomptabiliteReadApi(
  events: any[]
): PrecomptabiliteReadController {
  const projection = new PrecomptabiliteProjection();

  for (const event of events) {
    projection.apply(event);
  }

  const repo = new InMemoryPrecomptabiliteReadRepository(
    projection.snapshotDocuments(),
    projection.snapshotStatuses(),
    projection.snapshotAnalytics(),
    projection.snapshotExposure()
  );

  return new PrecomptabiliteReadController(repo);
}
