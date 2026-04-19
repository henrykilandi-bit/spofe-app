// src/read-models/index.ts

export { AmortizationProjection } from './projections/AmortizationProjection';
export { InMemoryAmortizationReadRepository } from './repositories/InMemoryAmortizationReadRepository';

export type { AmortizationReadRepository } from './ports/AmortizationReadRepository';

export type {
  AmortizationPlanRM,
  AmortizationScheduleRM,
  AmortizationAccumulatedRM,
  AssetNetValueRM,
  AmortizationHistoryRM,
} from './types';
