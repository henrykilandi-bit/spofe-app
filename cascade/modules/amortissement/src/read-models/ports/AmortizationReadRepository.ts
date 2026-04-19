// src/read-models/ports/AmortizationReadRepository.ts

import {
  AmortizationPlanRM,
  AmortizationScheduleRM,
  AmortizationAccumulatedRM,
  AssetNetValueRM,
  AmortizationHistoryRM,
} from '../types';

export interface AmortizationReadRepository {
  getPlans(tenantId: string): Promise<AmortizationPlanRM[]>;
  getSchedule(tenantId: string): Promise<AmortizationScheduleRM[]>;
  getAccumulated(
    tenantId: string
  ): Promise<AmortizationAccumulatedRM[]>;
  getNetValues(
    tenantId: string
  ): Promise<AssetNetValueRM[]>;
  getHistory(
    tenantId: string
  ): Promise<AmortizationHistoryRM[]>;
}
