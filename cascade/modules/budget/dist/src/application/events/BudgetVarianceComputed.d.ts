export interface BudgetVarianceComputed {
    type: 'BudgetVarianceComputed';
    payload: {
        tenantId: string;
        budgetId: string;
        period: string;
        variance: number;
        occurredAt: string;
    };
}
//# sourceMappingURL=BudgetVarianceComputed.d.ts.map