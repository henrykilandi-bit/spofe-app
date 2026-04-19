export type BudgetType = 'OBJECTIVE' | 'CASHFLOW';
export interface BudgetObjectiveRM {
    tenantId: string;
    budgetId: string;
    targetType: 'PRODUCT' | 'ACTIVITY';
    targetId: string;
    period: string;
    amount: number;
}
export interface BudgetCashflowRM {
    tenantId: string;
    budgetId: string;
    period: string;
    inflow: number;
    outflow: number;
    net: number;
}
export interface BudgetVarianceRM {
    tenantId: string;
    budgetId: string;
    period: string;
    variance: number;
}
export interface BudgetTimelineRM {
    tenantId: string;
    budgetId: string;
    period: string;
    projectedAmount: number;
}
export interface BudgetAlertRM {
    tenantId: string;
    budgetId: string;
    period: string;
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
}
//# sourceMappingURL=types.d.ts.map