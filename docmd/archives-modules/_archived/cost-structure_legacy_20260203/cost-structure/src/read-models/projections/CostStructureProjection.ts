// src/read-models/projections/CostStructureProjection.ts

import {
  CostByProductRM,
  CostByActivityRM,
  CostByPeriodRM,
  CostBreakdownRM,
  CostScenarioRM,
  CostLevel,
} from '../types';

type CostStructureEvent =
  | {
      type: 'CostStructureBuilt' | 'CostStructureRevised';
      payload: {
        tenantId: string;
        level: CostLevel;
        period: string;
        occurredAt: string;
      };
    }
  | {
      type: 'CostComputed';
      payload: {
        tenantId: string;
        targetType: 'PRODUCT' | 'ACTIVITY' | 'PROJECT';
        targetId: string;
        level: CostLevel;
        period: string;
        amount: number;
        occurredAt: string;
      };
    }
  | {
      type: 'CostSourceBreakdown';
      payload: {
        tenantId: string;
        level: CostLevel;
        period: string;
        sourceType: 'STOCK' | 'AMORTIZATION';
        sourceId: string;
        amount: number;
      };
    };

export class CostStructureProjection {
  private byProduct: CostByProductRM[] = [];
  private byActivity: CostByActivityRM[] = [];
  private byPeriod = new Map<string, number>();
  private breakdown: CostBreakdownRM[] = [];

  apply(event: CostStructureEvent): void {
    if (event.type === 'CostComputed') {
      const p = event.payload;

      if (p.targetType === 'PRODUCT') {
        this.byProduct.push({
          tenantId: p.tenantId,
          productId: p.targetId,
          level: p.level,
          period: p.period,
          amount: p.amount,
        });
      }

      if (p.targetType === 'ACTIVITY') {
        this.byActivity.push({
          tenantId: p.tenantId,
          activityId: p.targetId,
          level: p.level,
          period: p.period,
          amount: p.amount,
        });
      }

      const key = `${p.tenantId}::${p.level}::${p.period}`;
      this.byPeriod.set(
        key,
        (this.byPeriod.get(key) ?? 0) + p.amount
      );
    }

    if (event.type === 'CostSourceBreakdown') {
      const p = event.payload;
      this.breakdown.push({
        tenantId: p.tenantId,
        level: p.level,
        period: p.period,
        sourceType: p.sourceType,
        sourceId: p.sourceId,
        amount: p.amount,
      });
    }
  }

  snapshotByProduct(): CostByProductRM[] {
    return [...this.byProduct];
  }

  snapshotByActivity(): CostByActivityRM[] {
    return [...this.byActivity];
  }

  snapshotByPeriod(): CostByPeriodRM[] {
    return Array.from(this.byPeriod.entries()).map(
      ([key, totalAmount]) => {
        const [tenantId, level, period] = key.split('::');
        return {
          tenantId,
          level: level as CostLevel,
          period,
          totalAmount,
        };
      }
    );
  }

  snapshotBreakdown(): CostBreakdownRM[] {
    return [...this.breakdown];
  }

  snapshotScenarios(): CostScenarioRM[] {
    return this.snapshotByPeriod().flatMap(p => [
      {
        tenantId: p.tenantId,
        level: p.level,
        period: p.period,
        scenario: 'S70',
        amount: p.totalAmount * 0.7,
      },
      {
        tenantId: p.tenantId,
        level: p.level,
        period: p.period,
        scenario: 'S100',
        amount: p.totalAmount,
      },
      {
        tenantId: p.tenantId,
        level: p.level,
        period: p.period,
        scenario: 'S130',
        amount: p.totalAmount * 1.3,
      },
    ]);
  }
}
