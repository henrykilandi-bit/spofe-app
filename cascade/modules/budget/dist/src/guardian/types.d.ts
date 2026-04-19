export type BudgetType = 'OBJECTIVE' | 'CASHFLOW';
export type BudgetStatus = 'DRAFT' | 'VALIDATED' | 'CLOSED';
export interface GuardianContext {
    tenantId: string;
    actorId: string;
}
export interface BudgetHypothesis {
    key: string;
    description: string;
    value: number;
    sourceModule?: 'COST_STRUCTURE' | 'AMORTIZATION' | 'STOCK' | 'SALES';
}
export interface BudgetLine {
    targetType: 'PRODUCT' | 'ACTIVITY' | 'CATEGORY';
    targetId: string;
    period: string;
    amount: number;
}
export interface BudgetCommand {
    commandId: string;
    commandType: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'CLOSE';
    tenantId: string;
    budgetId: string;
    budgetType?: BudgetType;
    status?: BudgetStatus;
    periodFrom?: string;
    periodTo?: string;
    hypotheses?: BudgetHypothesis[];
    lines?: BudgetLine[];
}
//# sourceMappingURL=types.d.ts.map