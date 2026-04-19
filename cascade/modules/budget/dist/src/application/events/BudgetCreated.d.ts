export interface BudgetCreated {
    type: 'BudgetCreated';
    payload: {
        tenantId: string;
        budgetId: string;
        budgetType: string;
        periodFrom: string;
        periodTo: string;
        occurredAt: string;
    };
}
//# sourceMappingURL=BudgetCreated.d.ts.map