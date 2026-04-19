import { BudgetObjectiveRM, BudgetCashflowRM, BudgetVarianceRM, BudgetTimelineRM, BudgetAlertRM } from '../types';
type BudgetEvent = {
    type: 'BudgetCreated' | 'BudgetUpdated' | 'BudgetValidated' | 'BudgetClosed';
    payload: {
        tenantId: string;
        budgetId: string;
        occurredAt: string;
    };
} | {
    type: 'BudgetVarianceComputed';
    payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        variance: number;
        occurredAt: string;
    };
} | {
    type: 'BudgetLineProjected';
    payload: {
        tenantId: string;
        budgetId: string;
        targetType: 'PRODUCT' | 'ACTIVITY';
        targetId: string;
        period: string;
        amount: number;
    };
} | {
    type: 'BudgetCashflowProjected';
    payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        inflow: number;
        outflow: number;
    };
} | {
    type: 'BudgetAlertRaised';
    payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        level: 'INFO' | 'WARNING' | 'CRITICAL';
        message: string;
    };
};
export declare class BudgetProjection {
    private objectives;
    private cashflows;
    private variances;
    private timelines;
    private alerts;
    apply(event: BudgetEvent): void;
    snapshotObjectives(): BudgetObjectiveRM[];
    snapshotCashflows(): BudgetCashflowRM[];
    snapshotVariances(): BudgetVarianceRM[];
    snapshotTimelines(): BudgetTimelineRM[];
    snapshotAlerts(): BudgetAlertRM[];
}
export {};
//# sourceMappingURL=BudgetProjection.d.ts.map