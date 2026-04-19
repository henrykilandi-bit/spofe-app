/**
 * DTO - Budget Execution
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 */

export class BudgetExecutionDTO {
  tenantId!: string;
  productId!: string;
  periodDate!: string;
  actualAmount!: number;
}
