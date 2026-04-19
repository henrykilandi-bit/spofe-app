/**
 * DTO - Budget Alert
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */
export declare class BudgetAlertDTO {
    tenantId: string;
    budgetId: string;
    periodDate: string;
    projectedTotal: number;
    alertLevel: 'CRITICAL' | 'WARNING' | 'OK';
    alertMessage: string;
}
//# sourceMappingURL=budget-alert.dto.d.ts.map