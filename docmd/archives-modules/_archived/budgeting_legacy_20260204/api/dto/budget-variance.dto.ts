/**
 * DTO - Budget Variance
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */

export class BudgetVarianceDTO {
  tenantId!: string;
  budgetId!: string;
  productId!: string;
  periodDate!: string;
  projectedAmount!: number;
  actualAmount!: number;
  variance!: number;
  variancePercentage!: number;
}
