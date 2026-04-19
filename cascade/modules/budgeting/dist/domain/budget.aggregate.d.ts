/**
 * Aggregate Root - BudgetObjectif
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
import { Period } from './value-objects';
import { BudgetObjectiveItem, SalesCapacityObjective, CostStructure, PaymentTermsSet } from './entities';
export type BudgetStatus = 'DRAFT' | 'VALIDATED' | 'CLOSED';
export interface BudgetObjectif {
    id: string;
    tenantId: string;
    period: Period;
    status: BudgetStatus;
    objectives: BudgetObjectiveItem[];
    salesCapacities: SalesCapacityObjective[];
    costStructures: CostStructure[];
    paymentTerms: PaymentTermsSet | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
}
export declare class BudgetObjectifAggregate {
    private state;
    private constructor();
    static create(params: {
        id: string;
        tenantId: string;
        period: Period;
        objectives: BudgetObjectiveItem[];
        createdBy: string;
    }): BudgetObjectifAggregate;
    static fromState(state: BudgetObjectif): BudgetObjectifAggregate;
    getState(): BudgetObjectif;
    updateObjectives(objectives: BudgetObjectiveItem[], updatedBy: string): void;
    attachCostStructure(costStructures: CostStructure[], attachedBy: string): void;
    defineSalesCapacity(salesCapacities: SalesCapacityObjective[], definedBy: string): void;
    definePaymentTerms(paymentTerms: PaymentTermsSet, definedBy: string): void;
    validate(validatedBy: string): void;
    close(closedBy: string): void;
}
//# sourceMappingURL=budget.aggregate.d.ts.map