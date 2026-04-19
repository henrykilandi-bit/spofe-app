/**
 * Contract Fixtures — Budget ↔ Cost-Structure
 * Version: v1.0.0
 *
 * Vérité du contrat : shape et valeurs attendues
 */
/**
 * Projet valide selon le contrat COUTFLEX → Budget
 * Toutes les conditions satisfaites :
 * - EconomicProject.status = VALIDATED
 * - CostStructure.status = FROZEN
 * - Simulation.viableAt70 = true
 * - marginAt70 > 0
 */
export declare const VALID_BUDGET_READY_PROJECT: {
    readonly tenantId: "tenant-1";
    readonly projectId: "project-123";
    readonly projectName: "Produit Test";
    readonly version: 2;
    readonly unitCost: 10;
    readonly totalCost: 10000;
    readonly netMargin: 0.25;
    readonly marginAt70: 0.08;
};
/**
 * Projets INVALIDES qui ne doivent jamais être exposés
 */
export declare const INVALID_PROJECTS: {
    /**
     * CT-BUD-02: Projet non VALIDATED
     */
    readonly notValidated: {
        readonly status: "SIMULATED";
        readonly tenantId: "tenant-1";
        readonly projectId: "project-123";
        readonly projectName: "Produit Test";
        readonly version: 2;
        readonly unitCost: 10;
        readonly totalCost: 10000;
        readonly netMargin: 0.25;
        readonly marginAt70: 0.08;
    };
    /**
     * CT-BUD-03: CostStructure non FROZEN
     */
    readonly notFrozen: {
        readonly frozen: false;
        readonly tenantId: "tenant-1";
        readonly projectId: "project-123";
        readonly projectName: "Produit Test";
        readonly version: 2;
        readonly unitCost: 10;
        readonly totalCost: 10000;
        readonly netMargin: 0.25;
        readonly marginAt70: 0.08;
    };
    /**
     * CT-BUD-04: marginAt70 ≤ 0 (non viable)
     */
    readonly notViable: {
        readonly marginAt70: -0.01;
        readonly tenantId: "tenant-1";
        readonly projectId: "project-123";
        readonly projectName: "Produit Test";
        readonly version: 2;
        readonly unitCost: 10;
        readonly totalCost: 10000;
        readonly netMargin: 0.25;
    };
    /**
     * CT-BUD-04 bis: marginAt70 = 0 (limite)
     */
    readonly marginAtZero: {
        readonly marginAt70: 0;
        readonly tenantId: "tenant-1";
        readonly projectId: "project-123";
        readonly projectName: "Produit Test";
        readonly version: 2;
        readonly unitCost: 10;
        readonly totalCost: 10000;
        readonly netMargin: 0.25;
    };
};
/**
 * Shape contractuel STRICT
 * Tous les champs obligatoires, aucun de plus
 */
export declare const CONTRACT_SHAPE: readonly ["tenantId", "projectId", "projectName", "version", "unitCost", "totalCost", "netMargin", "marginAt70"];
/**
 * Types des champs contractuels
 */
export declare const CONTRACT_FIELD_TYPES: Record<string, string>;
/**
 * Erreurs contractuelles attendues
 */
export declare const CONTRACT_ERRORS: {
    readonly NOT_AUTHORIZED_BY_COST_STRUCTURE: {
        readonly status: 403;
        readonly code: "NOT_AUTHORIZED_BY_COST_STRUCTURE";
        readonly message: "Project not validated by COUTFLEX";
    };
    readonly BUD_COUT_01: {
        readonly status: 403;
        readonly code: "BUD-COUT-01";
        readonly message: "Budget creation rejected - Project not validated by COUTFLEX";
    };
    readonly COST_STRUCTURE_VERSION_CHANGED: {
        readonly status: 200;
        readonly reason: "COST_STRUCTURE_VERSION_CHANGED";
    };
};
/**
 * Vérifier qu'un objet respecte le shape contractuel
 */
export declare function matchesContractShape(obj: any): boolean;
/**
 * Vérifier qu'un objet est un projet valide selon le contrat
 */
export declare function isValidBudgetReadyProject(obj: any): boolean;
//# sourceMappingURL=cost-structure.responses.d.ts.map