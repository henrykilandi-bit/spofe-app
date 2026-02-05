/**
 * Cost-Structure Module - Aggregate: CostStructure
 * Conformité: COUTFLEX Specification
 * Principe: Versioning strict, FROZEN = immutable
 */
import { Money, EconomicAssumptions, SimulationMetrics, CostLine, VersionStatus } from './value-objects';
import { CostStructureEvent } from './events';
/**
 * CostStructure - Aggregate (versionné)
 */
export declare class CostStructure {
    readonly costStructureId: string;
    readonly projectId: string;
    readonly version: number;
    readonly tenantId: string;
    status: VersionStatus;
    costLines: CostLine[];
    assumptions: EconomicAssumptions | null;
    computedMetrics: SimulationMetrics | null;
    readonly createdBy: string;
    readonly createdAt: Date;
    frozenAt?: Date | undefined;
    frozenBy?: string | undefined;
    constructor(costStructureId: string, projectId: string, version: number, tenantId: string, status: VersionStatus, costLines: CostLine[], assumptions: EconomicAssumptions | null, computedMetrics: SimulationMetrics | null, createdBy: string, createdAt: Date, frozenAt?: Date | undefined, frozenBy?: string | undefined);
    /**
     * COUT-CS-03: Vérifier immutabilité FROZEN
     */
    private assertNotFrozen;
    /**
     * Créer une nouvelle structure de coûts
     */
    static create(costStructureId: string, projectId: string, version: number, tenantId: string, actorId: string): {
        aggregate: CostStructure;
        events: CostStructureEvent[];
    };
    /**
     * Ajouter une ligne de coût
     * COUT-CS-02: amount > 0, category valide
     */
    addCostLine(category: 'VARIABLE' | 'FIXED' | 'INDIRECT', label: string, amount: Money, allocationRule: string | undefined, actorId: string): CostStructureEvent[];
    /**
     * Mettre à jour les hypothèses économiques
     * COUT-CS-04: Hypothèses complètes
     */
    updateAssumptions(assumptions: EconomicAssumptions, actorId: string): CostStructureEvent[];
    /**
     * Exécuter la simulation
     * COUT-SIM-01: Calcul reproductible
     * COUT-01: Test 70% calculé
     */
    runSimulation(metrics: SimulationMetrics, actorId: string): CostStructureEvent[];
    /**
     * Geler la structure de coûts
     * COUT-01: Test 70% doit être OK
     */
    freeze(actorId: string): CostStructureEvent[];
    /**
     * Vérifier si la structure est prête pour Budget
     * COUT-BUD-01: FROZEN + viable
     */
    isBudgetReady(): boolean;
    /**
     * Obtenir le résumé pour audit
     */
    getSummary(): {
        version: number;
        status: VersionStatus;
        costLinesCount: number;
        totalCost: number | null;
        marginAt70: number | null;
        viableAt70: boolean | null;
    };
}
//# sourceMappingURL=cost-structure.aggregate.d.ts.map