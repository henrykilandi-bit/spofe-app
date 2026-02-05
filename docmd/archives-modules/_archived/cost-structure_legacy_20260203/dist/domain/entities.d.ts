/**
 * Cost-Structure Module - Entities
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 */
import { CostLine, EconomicAssumptions, SimulationMetrics, VersionStatus } from './value-objects';
/**
 * CostStructureVersion - Version d'une structure de coûts
 */
export interface CostStructureVersion {
    version: number;
    status: VersionStatus;
    costLines: CostLine[];
    assumptions?: EconomicAssumptions;
    simulationMetrics?: SimulationMetrics;
    createdAt: Date;
    frozenAt?: Date;
    frozenBy?: string;
}
//# sourceMappingURL=entities.d.ts.map