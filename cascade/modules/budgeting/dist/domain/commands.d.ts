/**
 * Commands - Module Budget
 * Commandes métier pour l'agrégat BudgetObjectif
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
import { Period } from './value-objects';
import { BudgetObjectiveItem, SalesCapacityObjective, CostStructure, PaymentTermsSet } from './entities';
export type BudgetCommand = CreateBudgetObjectif | UpdateBudgetObjectives | ValidateBudgetObjectif | AttachCostStructure | DefineSalesCapacity | DefinePaymentTerms | CloseBudgetObjectif;
export interface CreateBudgetObjectif {
    type: 'CREATE_BUDGET_OBJECTIF';
    tenantId: string;
    period: Period;
    objectives: BudgetObjectiveItem[];
    createdBy: string;
}
export interface UpdateBudgetObjectives {
    type: 'UPDATE_BUDGET_OBJECTIVES';
    budgetId: string;
    tenantId: string;
    objectives: BudgetObjectiveItem[];
    updatedBy: string;
}
export interface ValidateBudgetObjectif {
    type: 'VALIDATE_BUDGET_OBJECTIF';
    budgetId: string;
    tenantId: string;
    validatedBy: string;
}
export interface AttachCostStructure {
    type: 'ATTACH_COST_STRUCTURE';
    budgetId: string;
    tenantId: string;
    costStructures: CostStructure[];
    attachedBy: string;
}
export interface DefineSalesCapacity {
    type: 'DEFINE_SALES_CAPACITY';
    budgetId: string;
    tenantId: string;
    salesCapacities: SalesCapacityObjective[];
    definedBy: string;
}
export interface DefinePaymentTerms {
    type: 'DEFINE_PAYMENT_TERMS';
    budgetId: string;
    tenantId: string;
    paymentTerms: PaymentTermsSet;
    definedBy: string;
}
export interface CloseBudgetObjectif {
    type: 'CLOSE_BUDGET_OBJECTIF';
    budgetId: string;
    tenantId: string;
    closedBy: string;
}
//# sourceMappingURL=commands.d.ts.map