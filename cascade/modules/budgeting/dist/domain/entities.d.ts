/**
 * Entities - Module Budget
 * Entités internes à l'agrégat BudgetObjectif
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
import { Money, Quantity, PaymentTerm } from './value-objects';
export interface BudgetObjectiveItem {
    productId: string;
    productName: string;
    targetQuantity: Quantity;
    unitPrice: Money;
    totalAmount: Money;
    category: 'SALES' | 'PRODUCTION' | 'EXPENSE';
}
export interface SalesCapacityObjective {
    productId: string;
    maxCapacity: Quantity;
    currentUtilization: Quantity;
    availableCapacity: Quantity;
}
export interface CostStructure {
    productId: string;
    fixedCosts: Money;
    variableCostPerUnit: Money;
    totalEstimatedCost: Money;
}
export interface PaymentTermsSet {
    customerPaymentTerm: PaymentTerm;
    supplierPaymentTerm: PaymentTerm;
}
//# sourceMappingURL=entities.d.ts.map