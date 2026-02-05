/**
 * Guardian — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * Point UNIQUE de validation des invariants métier.
 * Aucune logique métier ne doit exister ailleurs.
 *
 * Invariants implémentés:
 * - COUT-01: Variable cost ratio ≤ 70%
 * - COUT-EP-01: Unique project name per tenant
 * - COUT-EP-02: Project type immutable
 * - COUT-CS-01: Version strictly increasing
 * - COUT-CS-02: Cost category from allowed list
 * - COUT-CS-03: No modification after freeze
 * - COUT-CS-04: Assumptions required before simulation
 * - COUT-SIM-01: Simulation idempotent
 * - COUT-SIM-02: Only SIMULATED can be frozen
 * - COUT-DEC-01: Only validated project → APPROVED
 * - COUT-DEC-02: Decision is terminal
 * - COUT-BUD-01: Budget can consume only APPROVED
 */
/**
 * Union type for all Cost-Structure commands.
 * Defined here to avoid importing from application layer.
 * Uses 'commandType' discriminator to match application layer commands.
 *
 * NOTE: These types must stay in sync with application/commands/*.command.ts
 */
export type CostStructureCommand = {
    commandType: 'CreateEconomicProject';
    tenantId: string;
    projectId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    actorId: string;
} | {
    commandType: 'CreateCostStructure';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
} | {
    commandType: 'AddCostLine';
    tenantId: string;
    projectId: string;
    version: number;
    category: 'VARIABLE' | 'FIXED' | 'INDIRECT';
    label: string;
    amount: number;
    currency: string;
    allocationRule?: string;
    actorId: string;
} | {
    commandType: 'UpdateAssumptions';
    tenantId: string;
    projectId: string;
    version: number;
    priceTarget: number;
    expectedVolume: number;
    capacityMax: number;
    scenarios: {
        pessimistic: number;
        realistic: number;
        optimistic: number;
    };
    actorId: string;
} | {
    commandType: 'RunSimulation';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
} | {
    commandType: 'FreezeCostStructure';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
} | {
    commandType: 'ValidateProject';
    tenantId: string;
    projectId: string;
    actorId: string;
    justification?: string;
} | {
    commandType: 'RejectProject';
    tenantId: string;
    projectId: string;
    actorId: string;
    reason: string;
};
export interface EconomicProjectState {
    projectId: string;
    tenantId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    status: 'DRAFT' | 'SIMULATED' | 'FROZEN' | 'VALIDATED' | 'REJECTED' | 'APPROVED';
    latestVersion?: number;
}
export interface CostStructureState {
    projectId: string;
    tenantId: string;
    version: number;
    status: 'DRAFT' | 'SIMULATED' | 'FROZEN';
    costLines: CostLine[];
    assumptions?: AssumptionsState;
    simulation?: SimulationResult;
}
export interface CostLine {
    lineId: string;
    category: 'VARIABLE' | 'FIXED' | 'INDIRECT';
    label: string;
    amount: number;
    currency: string;
    allocationRule?: string;
}
export interface AssumptionsState {
    priceTarget: number;
    expectedVolume: number;
    capacityMax: number;
    scenarios: {
        pessimistic: number;
        realistic: number;
        optimistic: number;
    };
}
export interface SimulationResult {
    totalCost: number;
    variableCostRatio: number;
    breakEvenPoint: number;
    marginAtTarget: number;
    scenarioResults: {
        pessimistic: {
            margin: number;
            roi: number;
        };
        realistic: {
            margin: number;
            roi: number;
        };
        optimistic: {
            margin: number;
            roi: number;
        };
    };
}
export interface DecisionRecordState {
    decisionId: string;
    projectId: string;
    tenantId: string;
    decision: 'VALIDATE' | 'REJECT' | 'REVISE';
    decidedBy: string;
    decidedAt: Date;
}
export interface GuardianContext {
    project?: EconomicProjectState;
    costStructure?: CostStructureState;
    existingProjectByName?: EconomicProjectState;
    latestDecision?: DecisionRecordState;
}
export declare class InvariantViolationError extends Error {
    readonly invariantCode: string;
    readonly context?: Record<string, unknown> | undefined;
    readonly details: string;
    constructor(invariantCode: string, details: string, context?: Record<string, unknown> | undefined);
}
export declare class CostStructureGuardian {
    /**
     * Point unique de validation — délègue à la règle appropriée
     */
    validate(command: CostStructureCommand, state: GuardianContext): GuardianContext;
    private validateCreateEconomicProject;
    private validateCreateCostStructure;
    private validateAddCostLine;
    private validateUpdateAssumptions;
    private validateRunSimulation;
    private validateFreezeCostStructure;
    private validateValidateProject;
    private validateRejectProject;
}
//# sourceMappingURL=cost-structure.guardian.d.ts.map