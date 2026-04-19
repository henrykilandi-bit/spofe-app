// src/read-models/projections/BudgetProjection.ts

import {
  BudgetObjectiveRM,
  BudgetCashflowRM,
  BudgetVarianceRM,
  BudgetTimelineRM,
  BudgetAlertRM,
} from '../types';

type BudgetEvent =
  | {
      type: 'BudgetUpdated' | 'BudgetValidated' | 'BudgetClosed';
      payload: {
        tenantId: string;
        budgetId: string;
        occurredAt: string;
      };
    }
  | {
      type: 'BudgetCreated';
      payload: {
        tenantId: string;
        budgetId: string;
        budgetType: string;
        periodFrom: string;
        periodTo: string;
        lines: Array<{
          targetType: 'PRODUCT' | 'ACTIVITY' | 'CATEGORY';
          targetId: string;
          period: string;
          amount: number;
        }>;
        occurredAt: string;
      };
    }
  | {
      type: 'BudgetVarianceComputed';
      payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        variance: number;
        occurredAt: string;
      };
    }
  | {
      type: 'BudgetLineProjected';
      payload: {
        tenantId: string;
        budgetId: string;
        targetType: 'PRODUCT' | 'ACTIVITY';
        targetId: string;
        period: string;
        amount: number;
      };
    }
  | {
      type: 'BudgetCashflowProjected';
      payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        inflow: number;
        outflow: number;
      };
    }
  | {
      type: 'BudgetAlertRaised';
      payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        level: 'INFO' | 'WARNING' | 'CRITICAL';
        message: string;
      };
    };

export class BudgetProjection {
  private objectives: BudgetObjectiveRM[] = [];
  private cashflows: BudgetCashflowRM[] = [];
  private variances: BudgetVarianceRM[] = [];
  private timelines: BudgetTimelineRM[] = [];
  private alerts: BudgetAlertRM[] = [];

  apply(event: BudgetEvent): void {
    switch (event.type) {
      case 'BudgetCreated': {
        const p = event.payload;

        for (const line of p.lines) {
          if (line.targetType === 'CATEGORY') {
            continue;
          }

          this.objectives.push({
            tenantId: p.tenantId,
            budgetId: p.budgetId,
            targetType: line.targetType,
            targetId: line.targetId,
            period: line.period,
            amount: line.amount,
          });

          this.timelines.push({
            tenantId: p.tenantId,
            budgetId: p.budgetId,
            period: line.period,
            projectedAmount: line.amount,
          });
        }

        break;
      }

      case 'BudgetLineProjected': {
        const p = event.payload;
        this.objectives.push({
          tenantId: p.tenantId,
          budgetId: p.budgetId,
          targetType: p.targetType,
          targetId: p.targetId,
          period: p.period,
          amount: p.amount,
        });
        this.timelines.push({
          tenantId: p.tenantId,
          budgetId: p.budgetId,
          period: p.period,
          projectedAmount: p.amount,
        });
        break;
      }

      case 'BudgetCashflowProjected': {
        const p = event.payload;
        this.cashflows.push({
          tenantId: p.tenantId,
          budgetId: p.budgetId,
          period: p.period,
          inflow: p.inflow,
          outflow: p.outflow,
          net: p.inflow - p.outflow,
        });
        break;
      }

      case 'BudgetVarianceComputed': {
        const p = event.payload;
        this.variances.push({
          tenantId: p.tenantId,
          budgetId: p.budgetId,
          period: p.period,
          variance: p.variance,
        });
        break;
      }

      case 'BudgetAlertRaised': {
        const p = event.payload;
        this.alerts.push({
          tenantId: p.tenantId,
          budgetId: p.budgetId,
          period: p.period,
          level: p.level,
          message: p.message,
        });
        break;
      }
    }
  }

  snapshotObjectives(): BudgetObjectiveRM[] {
    return [...this.objectives];
  }

  snapshotCashflows(): BudgetCashflowRM[] {
    return [...this.cashflows];
  }

  snapshotVariances(): BudgetVarianceRM[] {
    return [...this.variances];
  }

  snapshotTimelines(): BudgetTimelineRM[] {
    return [...this.timelines];
  }

  snapshotAlerts(): BudgetAlertRM[] {
    return [...this.alerts];
  }
}
