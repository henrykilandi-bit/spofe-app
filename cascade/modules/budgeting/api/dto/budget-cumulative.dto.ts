/**
 * DTO - Budget Cumulative
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */

export class BudgetCumulativeDTO {
  tenantId!: string;
  budgetId!: string;
  productId!: string;
  periodDate!: string;
  projectedAmount!: number;
  cumulativeProjectedAmount!: number;
}
