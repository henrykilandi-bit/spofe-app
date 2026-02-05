/**
 * Cost-Structure Invariants (COUTFLEX)
 * Conformité: Spécification COUTFLEX complète
 * Principe: 1 invariant = 1 test Guardian bloquant
 */
/**
 * Codes d'invariants (exhaustifs)
 */
export declare const INVARIANT_CODES: {
    readonly COUT_SEC_01: "COUT-SEC-01";
    readonly COUT_PROJ_01: "COUT-PROJ-01";
    readonly COUT_PROJ_02: "COUT-PROJ-02";
    readonly COUT_PROJ_03: "COUT-PROJ-03";
    readonly COUT_CS_01: "COUT-CS-01";
    readonly COUT_CS_02: "COUT-CS-02";
    readonly COUT_CS_03: "COUT-CS-03";
    readonly COUT_CS_04: "COUT-CS-04";
    readonly COUT_SIM_01: "COUT-SIM-01";
    readonly COUT_SIM_02: "COUT-SIM-02";
    readonly COUT_01: "COUT-01";
    readonly COUT_DEC_01: "COUT-DEC-01";
    readonly COUT_DEC_02: "COUT-DEC-02";
    readonly COUT_BUD_01: "COUT-BUD-01";
};
/**
 * Descriptions des invariants
 */
export declare const INVARIANT_DESCRIPTIONS: {
    "COUT-SEC-01": string;
    "COUT-PROJ-01": string;
    "COUT-PROJ-02": string;
    "COUT-PROJ-03": string;
    "COUT-CS-01": string;
    "COUT-CS-02": string;
    "COUT-CS-03": string;
    "COUT-CS-04": string;
    "COUT-SIM-01": string;
    "COUT-SIM-02": string;
    "COUT-01": string;
    "COUT-DEC-01": string;
    "COUT-DEC-02": string;
    "COUT-BUD-01": string;
};
/**
 * Transitions de statut autorisées (COUT-PROJ-02)
 */
export declare const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]>;
/**
 * Vérifier si une transition de statut est autorisée
 */
export declare function isStatusTransitionAllowed(from: string, to: string): boolean;
/**
 * Vérifier si un statut est terminal (COUT-PROJ-03)
 */
export declare function isTerminalStatus(status: string): boolean;
/**
 * Catégories de coûts valides (COUT-CS-02)
 */
export declare const VALID_COST_CATEGORIES: readonly ["VARIABLE", "FIXED", "INDIRECT"];
/**
 * Vérifier si une catégorie de coût est valide
 */
export declare function isValidCostCategory(category: string): boolean;
/**
 * Matrice de tests (référence)
 */
export declare const TEST_MATRIX: {
    "COUT-SEC-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-PROJ-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-PROJ-02": {
        type: string;
        bloquant: boolean;
    };
    "COUT-PROJ-03": {
        type: string;
        bloquant: boolean;
    };
    "COUT-CS-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-CS-02": {
        type: string;
        bloquant: boolean;
    };
    "COUT-CS-03": {
        type: string;
        bloquant: boolean;
    };
    "COUT-CS-04": {
        type: string;
        bloquant: boolean;
    };
    "COUT-SIM-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-SIM-02": {
        type: string;
        bloquant: boolean;
    };
    "COUT-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-DEC-01": {
        type: string;
        bloquant: boolean;
    };
    "COUT-DEC-02": {
        type: string;
        bloquant: boolean;
    };
    "COUT-BUD-01": {
        type: string;
        bloquant: boolean;
    };
};
/**
 * Interface du payload contractuel exposé à Budget
 * Vue rm_cost_projects_budget_ready
 */
export interface BudgetReadyProjectContract {
    tenantId: string;
    projectId: string;
    projectName: string;
    type: 'PRODUCT' | 'SERVICE';
    version: number;
    unitCost: number;
    totalCost: number;
    netMargin: number;
    marginAt70: number;
    viableAt70: boolean;
    validatedAt: Date;
}
/**
 * Invariants de contrat BUD-COUT-01
 * Ces invariants sont vérifiés côté Budget avant toute création
 */
export declare const CONTRACT_INVARIANTS: {
    /**
     * BUD-COUT-01: Pré-autorisation COUTFLEX obligatoire
     * Budget ne peut créer de budget que si le projet est dans rm_cost_projects_budget_ready
     */
    BUD_COUT_01: {
        code: string;
        description: string;
        errorMessage: string;
        /**
         * Vérifier qu'un projet est éligible à la budgétisation
         * @param project - Projet récupéré de rm_cost_projects_budget_ready
         * @returns true si le projet est valide et viable
         */
        validate: (project: BudgetReadyProjectContract | null) => boolean;
        /**
         * Conditions d'éligibilité budgétaire (documentées)
         * Cette méthode est informative pour la documentation
         */
        getEligibilityConditions: () => string[];
    };
};
/**
 * Vérificateur de contrat pour intégration Budget
 * Usage: côté Budget avant création
 */
export declare class BudgetContractValidator {
    /**
     * Valider qu'un projet peut recevoir un budget
     * @throws Error avec code BUD-COUT-01 si invalide
     */
    static validateBudgetCreation(project: BudgetReadyProjectContract | null): void;
    /**
     * Vérifier sans exception
     */
    static canCreateBudget(project: BudgetReadyProjectContract | null): boolean;
}
//# sourceMappingURL=invariants.d.ts.map