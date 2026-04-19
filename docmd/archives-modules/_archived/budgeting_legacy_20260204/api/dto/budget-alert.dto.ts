/**
 * DTO - Budget Alert
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */

export class BudgetAlertDTO {
  tenantId!: string;
  budgetId!: string;
  periodDate!: string;
  projectedTotal!: number;
  alertLevel!: 'CRITICAL' | 'WARNING' | 'OK';
  alertMessage!: string;
}
