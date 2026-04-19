// src/read-models/ports/BudgetReadRepository.ts

import {
  BudgetObjectiveRM,
  BudgetCashflowRM,
  BudgetVarianceRM,
  BudgetTimelineRM,
  BudgetAlertRM,
} from '../types';

export interface BudgetReadRepository {
  getObjectives(tenantId: string): Promise<BudgetObjectiveRM[]>;
  getCashflows(tenantId: string): Promise<BudgetCashflowRM[]>;
  getVariances(tenantId: string): Promise<BudgetVarianceRM[]>;
  getTimeline(tenantId: string): Promise<BudgetTimelineRM[]>;
  getAlerts(tenantId: string): Promise<BudgetAlertRM[]>;
}
