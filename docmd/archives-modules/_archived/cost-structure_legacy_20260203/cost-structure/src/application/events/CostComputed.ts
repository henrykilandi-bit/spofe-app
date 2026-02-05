// src/application/events/CostComputed.ts

export interface CostComputed {
  type: 'CostComputed';
  payload: {
    tenantId: string;
    targetType: 'PRODUCT' | 'ACTIVITY' | 'PROJECT';
    targetId: string;
    level: string;
    period: string;
    amount: number;
    occurredAt: string;
  };
}
