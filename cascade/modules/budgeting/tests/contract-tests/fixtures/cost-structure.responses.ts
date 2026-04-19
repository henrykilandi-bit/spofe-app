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
export const VALID_BUDGET_READY_PROJECT = {
  tenantId: 'tenant-1',
  projectId: 'project-123',
  projectName: 'Produit Test',
  version: 2,
  unitCost: 10,
  totalCost: 10000,
  netMargin: 0.25,
  marginAt70: 0.08,
} as const;

/**
 * Projets INVALIDES qui ne doivent jamais être exposés
 */
export const INVALID_PROJECTS = {
  /**
   * CT-BUD-02: Projet non VALIDATED
   */
  notValidated: {
    ...VALID_BUDGET_READY_PROJECT,
    status: 'SIMULATED' as const,
  },

  /**
   * CT-BUD-03: CostStructure non FROZEN
   */
  notFrozen: {
    ...VALID_BUDGET_READY_PROJECT,
    frozen: false,
  },

  /**
   * CT-BUD-04: marginAt70 ≤ 0 (non viable)
   */
  notViable: {
    ...VALID_BUDGET_READY_PROJECT,
    marginAt70: -0.01,
  },

  /**
   * CT-BUD-04 bis: marginAt70 = 0 (limite)
   */
  marginAtZero: {
    ...VALID_BUDGET_READY_PROJECT,
    marginAt70: 0,
  },
} as const;

/**
 * Shape contractuel STRICT
 * Tous les champs obligatoires, aucun de plus
 */
export const CONTRACT_SHAPE = [
  'tenantId',
  'projectId',
  'projectName',
  'version',
  'unitCost',
  'totalCost',
  'netMargin',
  'marginAt70',
] as const;

/**
 * Types des champs contractuels
 */
export const CONTRACT_FIELD_TYPES: Record<string, string> = {
  tenantId: 'string',
  projectId: 'string',
  projectName: 'string',
  version: 'number',
  unitCost: 'number',
  totalCost: 'number',
  netMargin: 'number',
  marginAt70: 'number',
} as const;

/**
 * Erreurs contractuelles attendues
 */
export const CONTRACT_ERRORS = {
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
} as const;

/**
 * Vérifier qu'un objet respecte le shape contractuel
 */
export function matchesContractShape(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;

  const keys = Object.keys(obj).sort();
  const expectedKeys = [...CONTRACT_SHAPE].sort();

  return JSON.stringify(keys) === JSON.stringify(expectedKeys);
}

/**
 * Vérifier qu'un objet est un projet valide selon le contrat
 */
export function isValidBudgetReadyProject(obj: any): boolean {
  if (!matchesContractShape(obj)) return false;

  // Vérifier les types
  for (const [key, expectedType] of Object.entries(CONTRACT_FIELD_TYPES)) {
    if (typeof obj[key] !== expectedType) return false;
  }

  // Vérifier la viabilité (COUT-01)
  if (obj.marginAt70 <= 0) return false;

  // Vérifier la version
  if (obj.version < 1) return false;

  return true;
}
