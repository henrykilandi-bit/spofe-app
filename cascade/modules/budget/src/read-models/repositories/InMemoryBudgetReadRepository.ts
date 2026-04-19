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
  ) {
    this.objectives = this.objectives.filter(o => this.isValidObjective(o));
    this.cashflows = this.cashflows
      .filter(c => this.isValidCashflow(c))
      .map(c => ({ ...c, net: c.inflow - c.outflow }));
    this.variances = this.variances.filter(v => this.isValidVariance(v));
    this.timelines = this.timelines.filter(t => this.isValidTimeline(t));
    this.alerts = this.alerts.filter(a => this.isValidAlert(a));
  }

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

  private isNonEmptyString(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isValidPeriod(value: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  }

  private isFiniteNumber(value: number): boolean {
    return Number.isFinite(value);
  }

  private isValidObjective(value: BudgetObjectiveRM): boolean {
    const validTargetType =
      value.targetType === 'PRODUCT' || value.targetType === 'ACTIVITY';
    return (
      this.isNonEmptyString(value.tenantId) &&
      this.isNonEmptyString(value.budgetId) &&
      validTargetType &&
      this.isNonEmptyString(value.targetId) &&
      this.isValidPeriod(value.period) &&
      this.isFiniteNumber(value.amount) &&
      value.amount > 0
    );
  }

  private isValidCashflow(value: BudgetCashflowRM): boolean {
    return (
      this.isNonEmptyString(value.tenantId) &&
      this.isNonEmptyString(value.budgetId) &&
      this.isValidPeriod(value.period) &&
      this.isFiniteNumber(value.inflow) &&
      this.isFiniteNumber(value.outflow) &&
      this.isFiniteNumber(value.net)
    );
  }

  private isValidVariance(value: BudgetVarianceRM): boolean {
    return (
      this.isNonEmptyString(value.tenantId) &&
      this.isNonEmptyString(value.budgetId) &&
      this.isValidPeriod(value.period) &&
      this.isFiniteNumber(value.variance)
    );
  }

  private isValidTimeline(value: BudgetTimelineRM): boolean {
    return (
      this.isNonEmptyString(value.tenantId) &&
      this.isNonEmptyString(value.budgetId) &&
      this.isValidPeriod(value.period) &&
      this.isFiniteNumber(value.projectedAmount)
    );
  }

  private isValidAlert(value: BudgetAlertRM): boolean {
    const validLevel =
      value.level === 'INFO' ||
      value.level === 'WARNING' ||
      value.level === 'CRITICAL';
    return (
      this.isNonEmptyString(value.tenantId) &&
      this.isNonEmptyString(value.budgetId) &&
      this.isValidPeriod(value.period) &&
      validLevel &&
      this.isNonEmptyString(value.message)
    );
  }
}
