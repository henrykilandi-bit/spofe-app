// src/read-models/projections/AmortizationProjection.ts

import {
  AmortizationPlanRM,
  AmortizationScheduleRM,
  AmortizationAccumulatedRM,
  AssetNetValueRM,
  AmortizationHistoryRM,
} from '../types';

type AmortizationEvent =
  | {
      type: 'AmortizationPlanCreated';
      payload: {
        tenantId: string;
        assetId: string;
        method: string;
        usefulLifeMonths: number;
        residualValue: number;
        startDate: string;
        occurredAt: string;
      };
    }
  | {
      type: 'AmortizationAccrued';
      payload: {
        tenantId: string;
        assetId: string;
        period: string;
        dotation: number;
        occurredAt: string;
      };
    }
  | {
      type: 'AmortizationPlanRevised';
      payload: {
        tenantId: string;
        assetId: string;
        usefulLifeMonths?: number;
        residualValue?: number;
        occurredAt: string;
      };
    }
  | {
      type: 'AmortizationStopped';
      payload: {
        tenantId: string;
        assetId: string;
        occurredAt: string;
      };
    };

export class AmortizationProjection {
  private plans = new Map<string, AmortizationPlanRM>();
  private schedules: AmortizationScheduleRM[] = [];
  private accumulated = new Map<string, number>();
  private history: AmortizationHistoryRM[] = [];

  apply(event: AmortizationEvent): void {
    const p = event.payload;
    const key = `${p.tenantId}::${p.assetId}`;

    this.history.push({
      tenantId: p.tenantId,
      assetId: p.assetId,
      eventType: event.type,
      occurredAt: p.occurredAt,
    });

    switch (event.type) {
      case 'AmortizationPlanCreated': {
        const planCreated = event.payload;
        this.plans.set(key, {
          tenantId: planCreated.tenantId,
          assetId: planCreated.assetId,
          method: planCreated.method,
          usefulLifeMonths: planCreated.usefulLifeMonths,
          residualValue: planCreated.residualValue,
          startDate: planCreated.startDate,
          status: 'ACTIVE',
        });
        this.accumulated.set(key, 0);
        break;
      }

      case 'AmortizationAccrued': {
        const accrued = event.payload;
        this.schedules.push({
          tenantId: accrued.tenantId,
          assetId: accrued.assetId,
          period: accrued.period,
          dotation: accrued.dotation,
        });
        this.accumulated.set(
          key,
          (this.accumulated.get(key) ?? 0) + accrued.dotation
        );
        break;
      }

      case 'AmortizationPlanRevised': {
        const revised = event.payload;
        const plan = this.plans.get(key);
        if (plan) {
          this.plans.set(key, {
            ...plan,
            usefulLifeMonths:
              revised.usefulLifeMonths ?? plan.usefulLifeMonths,
            residualValue:
              revised.residualValue ?? plan.residualValue,
          });
        }
        break;
      }

      case 'AmortizationStopped': {
        const plan = this.plans.get(key);
        if (plan) {
          this.plans.set(key, {
            ...plan,
            status: 'STOPPED',
          });
        }
        break;
      }
    }
  }

  snapshotPlans(): AmortizationPlanRM[] {
    return Array.from(this.plans.values());
  }

  snapshotSchedules(): AmortizationScheduleRM[] {
    return [...this.schedules];
  }

  snapshotAccumulated(): AmortizationAccumulatedRM[] {
    return Array.from(this.accumulated.entries()).map(
      ([key, accumulated]) => {
        const [tenantId, assetId] = key.split('::');
        return { tenantId, assetId, accumulated };
      }
    );
  }

  snapshotNetValues(
    acquisitionValues: Record<string, number>
  ): AssetNetValueRM[] {
    return Array.from(this.accumulated.entries()).map(
      ([key, accumulated]) => {
        const [tenantId, assetId] = key.split('::');
        const acquisition = acquisitionValues[key] ?? 0;
        return {
          tenantId,
          assetId,
          netValue: acquisition - accumulated,
        };
      }
    );
  }

  snapshotHistory(): AmortizationHistoryRM[] {
    return [...this.history];
  }
}
