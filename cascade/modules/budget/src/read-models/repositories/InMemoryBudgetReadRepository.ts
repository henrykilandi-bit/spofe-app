// src/read-models/repositories/InMemoryBudgetReadRepository.ts

import { BudgetReadRepository } from '../ports/BudgetReadRepository';
import {
  BudgetObjectiveRM,
  BudgetCashflowRM,
  BudgetVarianceRM,
  BudgetTimelineRM,
  BudgetAlertRM,
} from '../types';

export class InMemoryBudgetReadRepository implements BudgetReadRepository {
  constructor(
    private readonly objectives: BudgetObjectiveRM[],
    private readonly cashflows: BudgetCashflowRM[],
    private readonly variances: BudgetVarianceRM[],
    private readonly timelines: BudgetTimelineRM[],
    private readonly alerts: BudgetAlertRM[]
  ) {}

  async getObjectives(tenantId: string) {
    return this.objectives.filter(o => o.tenantId === tenantId);
  }

  async getCashflows(tenantId: string) {
    return this.cashflows.filter(c => c.tenantId === tenantId);
  }

  async getVariances(tenantId: string) {
    return this.variances.filter(v => v.tenantId === tenantId);
  }

  async getTimeline(tenantId: string) {
    return this.timelines.filter(t => t.tenantId === tenantId);
  }

  async getAlerts(tenantId: string) {
    return this.alerts.filter(a => a.tenantId === tenantId);
  }
}
