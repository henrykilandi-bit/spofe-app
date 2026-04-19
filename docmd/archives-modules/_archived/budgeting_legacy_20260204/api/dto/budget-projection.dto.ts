/**
 * DTO - Budget Projection
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */

export class BudgetProjectionDTO {
  tenantId!: string;
  budgetId!: string;
  productId!: string;
  periodDate!: string;
  projectedAmount!: number;
}
