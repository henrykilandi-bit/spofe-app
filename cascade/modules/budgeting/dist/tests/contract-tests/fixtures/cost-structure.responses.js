"use strict";
/**
 * Contract Fixtures — Budget ↔ Cost-Structure
 * Version: v1.0.0
 *
 * Vérité du contrat : shape et valeurs attendues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTRACT_ERRORS = exports.CONTRACT_FIELD_TYPES = exports.CONTRACT_SHAPE = exports.INVALID_PROJECTS = exports.VALID_BUDGET_READY_PROJECT = void 0;
exports.matchesContractShape = matchesContractShape;
exports.isValidBudgetReadyProject = isValidBudgetReadyProject;
/**
 * Projet valide selon le contrat COUTFLEX → Budget
 * Toutes les conditions satisfaites :
 * - EconomicProject.status = VALIDATED
 * - CostStructure.status = FROZEN
 * - Simulation.viableAt70 = true
 * - marginAt70 > 0
 */
exports.VALID_BUDGET_READY_PROJECT = {
    tenantId: 'tenant-1',
    projectId: 'project-123',
    projectName: 'Produit Test',
    version: 2,
    unitCost: 10,
    totalCost: 10000,
    netMargin: 0.25,
    marginAt70: 0.08,
};
/**
 * Projets INVALIDES qui ne doivent jamais être exposés
 */
exports.INVALID_PROJECTS = {
    /**
     * CT-BUD-02: Projet non VALIDATED
     */
    notValidated: {
        ...exports.VALID_BUDGET_READY_PROJECT,
        status: 'SIMULATED',
    },
    /**
     * CT-BUD-03: CostStructure non FROZEN
     */
    notFrozen: {
        ...exports.VALID_BUDGET_READY_PROJECT,
        frozen: false,
    },
    /**
     * CT-BUD-04: marginAt70 ≤ 0 (non viable)
     */
    notViable: {
        ...exports.VALID_BUDGET_READY_PROJECT,
        marginAt70: -0.01,
    },
    /**
     * CT-BUD-04 bis: marginAt70 = 0 (limite)
     */
    marginAtZero: {
        ...exports.VALID_BUDGET_READY_PROJECT,
        marginAt70: 0,
    },
};
/**
 * Shape contractuel STRICT
 * Tous les champs obligatoires, aucun de plus
 */
exports.CONTRACT_SHAPE = [
    'tenantId',
    'projectId',
    'projectName',
    'version',
    'unitCost',
    'totalCost',
    'netMargin',
    'marginAt70',
];
/**
 * Types des champs contractuels
 */
exports.CONTRACT_FIELD_TYPES = {
    tenantId: 'string',
    projectId: 'string',
    projectName: 'string',
    version: 'number',
    unitCost: 'number',
    totalCost: 'number',
    netMargin: 'number',
    marginAt70: 'number',
};
/**
 * Erreurs contractuelles attendues
 */
exports.CONTRACT_ERRORS = {
    NOT_AUTHORIZED_BY_COST_STRUCTURE: {
        status: 403,
        code: 'NOT_AUTHORIZED_BY_COST_STRUCTURE',
        message: 'Project not validated by COUTFLEX',
    },
    BUD_COUT_01: {
        status: 403,
        code: 'BUD-COUT-01',
        message: 'Budget creation rejected - Project not validated by COUTFLEX',
    },
    COST_STRUCTURE_VERSION_CHANGED: {
        status: 200, // Warning, not error
        reason: 'COST_STRUCTURE_VERSION_CHANGED',
    },
};
/**
 * Vérifier qu'un objet respecte le shape contractuel
 */
function matchesContractShape(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    const keys = Object.keys(obj).sort();
    const expectedKeys = [...exports.CONTRACT_SHAPE].sort();
    return JSON.stringify(keys) === JSON.stringify(expectedKeys);
}
/**
 * Vérifier qu'un objet est un projet valide selon le contrat
 */
function isValidBudgetReadyProject(obj) {
    if (!matchesContractShape(obj))
        return false;
    // Vérifier les types
    for (const [key, expectedType] of Object.entries(exports.CONTRACT_FIELD_TYPES)) {
        if (typeof obj[key] !== expectedType)
            return false;
    }
    // Vérifier la viabilité (COUT-01)
    if (obj.marginAt70 <= 0)
        return false;
    // Vérifier la version
    if (obj.version < 1)
        return false;
    return true;
}
//# sourceMappingURL=cost-structure.responses.js.map