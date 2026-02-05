/**
 * Cost-Structure Module - Aggregate Root: EconomicProject
 * Conformité: COUTFLEX Specification
 * Principe: Aggregate = source de vérité, état + comportements
 * Invariants: COUT-PROJ-01, COUT-PROJ-02, COUT-PROJ-03
 */
import { ProjectType, ProjectStatus, Money, EconomicAssumptions, SimulationMetrics } from './value-objects';
import { CostStructureVersion } from './entities';
import { CostStructureEvent } from './events';
/**
 * EconomicProject - Aggregate Root
 */
export declare class EconomicProject {
    readonly projectId: string;
    readonly tenantId: string;
    readonly name: string;
    readonly type: ProjectType;
    status: ProjectStatus;
    versions: CostStructureVersion[];
    readonly createdBy: string;
    readonly createdAt: Date;
    validatedAt?: Date | undefined;
    validatedBy?: string | undefined;
    rejectedAt?: Date | undefined;
    rejectedBy?: string | undefined;
    rejectionReason?: string | undefined;
    constructor(projectId: string, tenantId: string, name: string, type: ProjectType, status: ProjectStatus, versions: CostStructureVersion[], createdBy: string, createdAt: Date, validatedAt?: Date | undefined, validatedBy?: string | undefined, rejectedAt?: Date | undefined, rejectedBy?: string | undefined, rejectionReason?: string | undefined);
    /**
     * COUT-PROJ-03: Vérifier immutabilité post-décision
     */
    private assertNotTerminal;
    /**
     * COUT-PROJ-02: Vérifier transition de statut autorisée
     */
    private assertStatusTransition;
    /**
     * Obtenir la version courante (dernière FROZEN)
     */
    getCurrentVersion(): CostStructureVersion | null;
    /**
     * Vérifier si le projet est prêt pour Budget
     * COUT-BUD-01: status=VALIDATED + structure=FROZEN
     */
    isBudgetReady(): boolean;
    /**
     * Créer un nouveau projet économique
     */
    static create(projectId: string, tenantId: string, name: string, type: ProjectType, actorId: string): {
        aggregate: EconomicProject;
        events: CostStructureEvent[];
    };
    /**
     * Créer une nouvelle version de structure de coûts
     * COUT-PROJ-03: Interdit si projet terminal
     */
    createCostStructure(actorId: string): CostStructureEvent[];
    /**
     * Ajouter une ligne de coût
     */
    addCostLine(version: number, category: 'VARIABLE' | 'FIXED' | 'INDIRECT', label: string, amount: Money, allocationRule: string | undefined, actorId: string): CostStructureEvent[];
    /**
     * Mettre à jour les hypothèses économiques
     */
    updateAssumptions(version: number, assumptions: EconomicAssumptions, actorId: string): CostStructureEvent[];
    /**
     * Exécuter la simulation
     * COUT-PROJ-02: Transition DRAFT → SIMULATED
     */
    runSimulation(version: number, metrics: SimulationMetrics, actorId: string): CostStructureEvent[];
    /**
     * Geler une version de structure de coûts
     */
    freezeCostStructure(version: number, actorId: string): CostStructureEvent[];
    /**
     * Valider le projet
     * COUT-PROJ-02: Transition SIMULATED → VALIDATED
     * COUT-SIM-02: Simulation obligatoire avant validation
     */
    validate(actorId: string): CostStructureEvent[];
    /**
     * Rejeter le projet
     * COUT-PROJ-02: Transition SIMULATED → REJECTED
     * COUT-DEC-01: Autorité humaine requise
     */
    reject(reason: string, actorId: string): CostStructureEvent[];
}
//# sourceMappingURL=economic-project.aggregate.d.ts.map