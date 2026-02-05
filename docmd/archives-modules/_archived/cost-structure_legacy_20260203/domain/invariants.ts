/**
 * Cost-Structure Invariants (COUTFLEX)
 * Conformité: Spécification COUTFLEX complète
 * Principe: 1 invariant = 1 test Guardian bloquant
 */

/**
 * Codes d'invariants (exhaustifs)
 */
export const INVARIANT_CODES = {
  // Transverses (Tenant & Sécurité)
  COUT_SEC_01: 'COUT-SEC-01', // Isolation tenant

  // EconomicProject
  COUT_PROJ_01: 'COUT-PROJ-01', // Unicité projet (tenantId, name)
  COUT_PROJ_02: 'COUT-PROJ-02', // Cycle de vie strict
  COUT_PROJ_03: 'COUT-PROJ-03', // Immutabilité post-décision

  // CostStructure (structure & données)
  COUT_CS_01: 'COUT-CS-01', // Versioning strict
  COUT_CS_02: 'COUT-CS-02', // Lignes de coûts valides
  COUT_CS_03: 'COUT-CS-03', // Cohérence des allocations
  COUT_CS_04: 'COUT-CS-04', // Hypothèses complètes

  // Calcul & Simulation
  COUT_SIM_01: 'COUT-SIM-01', // Calcul reproductible
  COUT_SIM_02: 'COUT-SIM-02', // Simulation obligatoire avant décision

  // Invariant central (bloquant)
  COUT_01: 'COUT-01', // Test de robustesse à 70%

  // Décision
  COUT_DEC_01: 'COUT-DEC-01', // Autorité humaine
  COUT_DEC_02: 'COUT-DEC-02', // Décision finale

  // Intégration Budget
  COUT_BUD_01: 'COUT-BUD-01', // Pré-requis Budget
} as const;

/**
 * Descriptions des invariants
 */
export const INVARIANT_DESCRIPTIONS = {
  [INVARIANT_CODES.COUT_SEC_01]: 'Isolation multi-tenant: tenantId obligatoire, aucune lecture/écriture cross-tenant',
  
  [INVARIANT_CODES.COUT_PROJ_01]: 'Unicité projet: (tenantId, name) unique',
  [INVARIANT_CODES.COUT_PROJ_02]: 'Cycle de vie strict: DRAFT → SIMULATED → VALIDATED|REJECTED',
  [INVARIANT_CODES.COUT_PROJ_03]: 'Immutabilité post-décision: si VALIDATED ou REJECTED, aucune modification',
  
  [INVARIANT_CODES.COUT_CS_01]: 'Versioning strict: (projectId, version) unique, N+1 si N FROZEN',
  [INVARIANT_CODES.COUT_CS_02]: 'Lignes de coûts valides: amount > 0, category valide',
  [INVARIANT_CODES.COUT_CS_03]: 'Cohérence allocations: allocationRule valide, pas de circularité',
  [INVARIANT_CODES.COUT_CS_04]: 'Hypothèses complètes: priceTarget, volumes, scénarios présents',
  
  [INVARIANT_CODES.COUT_SIM_01]: 'Calcul reproductible: données identiques → résultats identiques',
  [INVARIANT_CODES.COUT_SIM_02]: 'Simulation obligatoire: ValidateProject interdit si status !== SIMULATED',
  
  [INVARIANT_CODES.COUT_01]: 'Test 70%: netMargin(70%) > 0 obligatoire pour freeze/validation',
  
  [INVARIANT_CODES.COUT_DEC_01]: 'Autorité humaine: validation/rejet requiert utilisateur identifié',
  [INVARIANT_CODES.COUT_DEC_02]: 'Décision finale: décision enregistrée est définitive',
  
  [INVARIANT_CODES.COUT_BUD_01]: 'Pré-requis Budget: status=VALIDATED + structure=FROZEN',
};

/**
 * Transitions de statut autorisées (COUT-PROJ-02)
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SIMULATED'],
  SIMULATED: ['VALIDATED', 'REJECTED'],
  VALIDATED: [], // Terminal
  REJECTED: [], // Terminal
};

/**
 * Vérifier si une transition de statut est autorisée
 */
export function isStatusTransitionAllowed(from: string, to: string): boolean {
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[from];
  return allowedTransitions ? allowedTransitions.includes(to) : false;
}

/**
 * Vérifier si un statut est terminal (COUT-PROJ-03)
 */
export function isTerminalStatus(status: string): boolean {
  return status === 'VALIDATED' || status === 'REJECTED';
}

/**
 * Catégories de coûts valides (COUT-CS-02)
 */
export const VALID_COST_CATEGORIES = ['VARIABLE', 'FIXED', 'INDIRECT'] as const;

/**
 * Vérifier si une catégorie de coût est valide
 */
export function isValidCostCategory(category: string): boolean {
  return VALID_COST_CATEGORIES.includes(category as any);
}

/**
 * Matrice de tests (référence)
 */
export const TEST_MATRIX = {
  [INVARIANT_CODES.COUT_SEC_01]: { type: 'E2E', bloquant: true },
  [INVARIANT_CODES.COUT_PROJ_01]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_PROJ_02]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_PROJ_03]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_CS_01]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_CS_02]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_CS_03]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_CS_04]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_SIM_01]: { type: 'Integration', bloquant: true },
  [INVARIANT_CODES.COUT_SIM_02]: { type: 'Integration', bloquant: true },
  [INVARIANT_CODES.COUT_01]: { type: 'Integration / E2E', bloquant: true },
  [INVARIANT_CODES.COUT_DEC_01]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_DEC_02]: { type: 'Unit Guardian', bloquant: true },
  [INVARIANT_CODES.COUT_BUD_01]: { type: 'Contract test', bloquant: true },
};

// ============================================================================
// CONTRAT COUTFLEX → BUDGET (BUD-COUT-01)
// ============================================================================

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
export const CONTRACT_INVARIANTS = {
  /**
   * BUD-COUT-01: Pré-autorisation COUTFLEX obligatoire
   * Budget ne peut créer de budget que si le projet est dans rm_cost_projects_budget_ready
   */
  BUD_COUT_01: {
    code: 'BUD-COUT-01',
    description: 'Pré-autorisation COUTFLEX obligatoire avant création budget',
    errorMessage: 'BUD-COUT-01: Budget creation rejected - Project not validated by COUTFLEX',
    
    /**
     * Vérifier qu'un projet est éligible à la budgétisation
     * @param project - Projet récupéré de rm_cost_projects_budget_ready
     * @returns true si le projet est valide et viable
     */
    validate: (project: BudgetReadyProjectContract | null): boolean => {
      if (!project) {
        return false;
      }
      // Toutes les conditions doivent être satisfaites
      return (
        project.viableAt70 === true &&
        project.marginAt70 > 0 &&
        project.version > 0
      );
    },

    /**
     * Conditions d'éligibilité budgétaire (documentées)
     * Cette méthode est informative pour la documentation
     */
    getEligibilityConditions: (): string[] => [
      'EconomicProject.status = VALIDATED',
      'CostStructure.status = FROZEN',
      'Simulation.viableAt70 = true',
      'Tenant isolation respected = true'
    ]
  }
};

/**
 * Vérificateur de contrat pour intégration Budget
 * Usage: côté Budget avant création
 */
export class BudgetContractValidator {
  /**
   * Valider qu'un projet peut recevoir un budget
   * @throws Error avec code BUD-COUT-01 si invalide
   */
  static validateBudgetCreation(project: BudgetReadyProjectContract | null): void {
    if (!CONTRACT_INVARIANTS.BUD_COUT_01.validate(project)) {
      throw new Error(CONTRACT_INVARIANTS.BUD_COUT_01.errorMessage);
    }
  }

  /**
   * Vérifier sans exception
   */
  static canCreateBudget(project: BudgetReadyProjectContract | null): boolean {
    return CONTRACT_INVARIANTS.BUD_COUT_01.validate(project);
  }
}
