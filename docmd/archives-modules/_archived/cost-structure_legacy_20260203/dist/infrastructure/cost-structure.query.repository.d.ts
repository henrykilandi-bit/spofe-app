/**
 * Cost-Structure Query Repository (Read-Models)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Lecture seule, aucun calcul métier, exposition décisions validées
 */
import { Pool } from 'pg';
/**
 * Read-Model DTOs (exposition API)
 */
export interface CostProjectReadModel {
    tenantId: string;
    projectId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';
    currentVersion: number;
    createdAt: Date;
    validatedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
}
export interface CostStructureCurrentReadModel {
    tenantId: string;
    projectId: string;
    version: number;
    status: 'FROZEN';
    createdAt: Date;
    frozenAt: Date;
    frozenBy: string;
}
export interface CostLineReadModel {
    tenantId: string;
    projectId: string;
    version: number;
    category: 'VARIABLE' | 'FIXED' | 'INDIRECT';
    label: string;
    amount: number;
    currency: string;
    allocationRule?: string;
    createdAt: Date;
}
export interface SimulationResultReadModel {
    tenantId: string;
    projectId: string;
    version: number;
    unitCost: number;
    totalCost: number;
    grossMargin: number;
    netMargin: number;
    marginAt70: number;
    viableAt70: boolean;
    simulatedAt: Date;
}
export interface CostDecisionReadModel {
    tenantId: string;
    projectId: string;
    version: number;
    decision: 'VALIDATED' | 'REJECTED';
    decidedBy: string;
    decidedAt: Date;
    justification?: string;
}
export interface BudgetReadyProjectReadModel {
    tenantId: string;
    projectId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    version: number;
    unitCost: number;
    totalCost: number;
    netMargin: number;
    marginAt70: number;
    viableAt70: boolean;
    validatedAt: Date;
}
export interface CostStructureSummaryReadModel {
    tenantId: string;
    projectId: string;
    version: number;
    costLinesCount: number;
    totalVariableCost: number;
    totalFixedCost: number;
    totalIndirectCost: number;
    totalCostSum: number;
    status: 'DRAFT' | 'FROZEN';
    frozenAt?: Date;
}
/**
 * Query Repository - Read-Models uniquement
 */
export declare class CostStructureQueryRepository {
    private readonly db;
    constructor(db: Pool);
    /**
     * Helper: Set tenant context for RLS
     */
    private setTenantContext;
    /**
     * Vue 1: Liste des projets économiques
     */
    findAllProjects(tenantId: string): Promise<CostProjectReadModel[]>;
    /**
     * Vue 1: Projet par ID
     */
    findProjectById(tenantId: string, projectId: string): Promise<CostProjectReadModel | null>;
    /**
     * Vue 2: Structure de coûts courante (FROZEN)
     */
    findCurrentCostStructure(tenantId: string, projectId: string): Promise<CostStructureCurrentReadModel | null>;
    /**
     * Vue 3: Lignes de coût
     */
    findCostLines(tenantId: string, projectId: string, version: number): Promise<CostLineReadModel[]>;
    /**
     * Vue 4: Résultats de simulation
     */
    findSimulationResults(tenantId: string, projectId: string, version: number): Promise<SimulationResultReadModel | null>;
    /**
     * Vue 5: Décisions finales
     */
    findDecisions(tenantId: string, projectId: string): Promise<CostDecisionReadModel[]>;
    /**
     * Vue 6: Projets prêts pour Budget (CONTRACTUEL)
     */
    findBudgetReadyProjects(tenantId: string): Promise<BudgetReadyProjectReadModel[]>;
    /**
     * Vue 7: Résumé structure de coûts
     */
    findCostStructureSummary(tenantId: string, projectId: string, version: number): Promise<CostStructureSummaryReadModel | null>;
}
//# sourceMappingURL=cost-structure.query.repository.d.ts.map