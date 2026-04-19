// src/read-models/repositories/InMemoryAmortizationReadRepository.ts

import { AmortizationReadRepository } from '../ports/AmortizationReadRepository';
import {
  AmortizationPlanRM,
  AmortizationScheduleRM,
  AmortizationAccumulatedRM,
  AssetNetValueRM,
  AmortizationHistoryRM,
} from '../types';

export class InMemoryAmortizationReadRepository
  implements AmortizationReadRepository
{
  constructor(
    private readonly plans: AmortizationPlanRM[],
    private readonly schedules: AmortizationScheduleRM[],
    private readonly accumulated: AmortizationAccumulatedRM[],
    private readonly netValues: AssetNetValueRM[],
    private readonly history: AmortizationHistoryRM[]
  ) {}

  async getPlans(
    tenantId: string
  ): Promise<AmortizationPlanRM[]> {
    return this.plans.filter(p => p.tenantId === tenantId);
  }

  async getSchedule(
    tenantId: string
  ): Promise<AmortizationScheduleRM[]> {
    return this.schedules.filter(s => s.tenantId === tenantId);
  }

  async getAccumulated(
    tenantId: string
  ): Promise<AmortizationAccumulatedRM[]> {
    return this.accumulated.filter(a => a.tenantId === tenantId);
  }

  async getNetValues(
    tenantId: string
  ): Promise<AssetNetValueRM[]> {
    return this.netValues.filter(n => n.tenantId === tenantId);
  }

  async getHistory(
    tenantId: string
  ): Promise<AmortizationHistoryRM[]> {
    return this.history.filter(h => h.tenantId === tenantId);
  }
}
