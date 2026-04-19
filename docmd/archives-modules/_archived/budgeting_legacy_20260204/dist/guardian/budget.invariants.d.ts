/**
 * Invariants Guardian - Module Budget
 * 8 invariants contractuels (MODULE_BUDGET_CONTRACT.md Section 4)
 */
import { BudgetObjectif, BudgetStatus } from '../domain/budget.aggregate';
export interface GuardianViolation {
    code: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
}
export interface GuardianResult {
    ok: boolean;
    violations: GuardianViolation[];
}
export declare class BudgetInvariants {
    /**
     * INV-BO-01: Unicité période
     * Un seul budget actif par période et par tenant
     */
    static invariantSingleActiveBudgetPerPeriod(newBudget: BudgetObjectif, existingBudgets: BudgetObjectif[]): GuardianResult;
    /**
     * INV-BO-03: Transitions état autorisées
     * DRAFT → VALIDATED → CLOSED
     */
    static invariantAllowedStateTransitions(currentStatus: BudgetStatus, newStatus: BudgetStatus): GuardianResult;
    /**
     * INV-BO-04: Immutabilité après validation
     * Aucune modification après VALIDATED sauf transition vers CLOSED
     */
    static invariantImmutableAfterValidation(budget: BudgetObjectif): GuardianResult;
    /**
     * INV-BO-06: Objectifs quantifiables
     * Toutes les quantités doivent être >= 0
     */
    static invariantObjectivesQuantifiable(budget: BudgetObjectif): GuardianResult;
    /**
     * INV-BO-09: Capacité non dépassée
     * Objectif <= capacité disponible
     */
    static invariantCapacityNotExceeded(budget: BudgetObjectif): GuardianResult;
    /**
     * INV-BO-11: Capacité définie
     * Chaque objectif doit avoir une capacité définie avant validation
     */
    static invariantObjectivesHaveCapacity(budget: BudgetObjectif): GuardianResult;
    /**
     * INV-BO-12: Structure coûts définie
     * Chaque objectif doit avoir une structure de coûts avant validation
     */
    static invariantObjectivesHaveCostStructure(budget: BudgetObjectif): GuardianResult;
    /**
     * INV-BO-15: Termes paiement requis
     * Les termes de paiement doivent être définis avant validation
     */
    static invariantPaymentTermsDefined(budget: BudgetObjectif): GuardianResult;
    private static periodsOverlap;
    /**
     * Valide tous les invariants pour un budget
     */
    static validateAll(budget: BudgetObjectif, existingBudgets?: BudgetObjectif[]): GuardianResult;
}
//# sourceMappingURL=budget.invariants.d.ts.map