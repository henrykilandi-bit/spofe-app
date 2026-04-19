// src/api/AmortizationApiWiring.ts

import { AmortizationReadController } from './AmortizationReadController';
import { AmortizationProjection } from '../read-models/projections/AmortizationProjection';
import { InMemoryAmortizationReadRepository } from '../read-models/repositories/InMemoryAmortizationReadRepository';

export function createAmortizationReadApi(
  events: any[],
  acquisitionValues: Record<string, number>
): AmortizationReadController {
  const projection = new AmortizationProjection();

  for (const event of events) {
    projection.apply(event);
  }

  const repo = new InMemoryAmortizationReadRepository(
    projection.snapshotPlans(),
    projection.snapshotSchedules(),
    projection.snapshotAccumulated(),
    projection.snapshotNetValues(acquisitionValues),
    projection.snapshotHistory()
  );

  return new AmortizationReadController(repo);
}
