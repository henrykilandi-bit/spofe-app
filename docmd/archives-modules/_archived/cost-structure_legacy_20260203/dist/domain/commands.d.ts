/**
 * Cost-Structure Module - Commands
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Intentions métier validées par Guardian
 */
import { ProjectType, CostLine, EconomicAssumptions } from './value-objects';
export type CostStructureCommand = CreateEconomicProjectCommand | CreateCostStructureCommand | AddCostLineCommand | UpdateAssumptionsCommand | RunSimulationCommand | FreezeCostStructureCommand | ValidateProjectCommand | RejectProjectCommand;
/**
 * Command 1 - CreateEconomicProject
 */
export interface CreateEconomicProjectCommand {
    type: 'CreateEconomicProject';
    tenantId: string;
    projectId: string;
    name: string;
    projectType: ProjectType;
    actorId: string;
}
/**
 * Command 2 - CreateCostStructure
 */
export interface CreateCostStructureCommand {
    type: 'CreateCostStructure';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
}
/**
 * Command 3 - AddCostLine
 */
export interface AddCostLineCommand {
    type: 'AddCostLine';
    tenantId: string;
    projectId: string;
    version: number;
    costLine: CostLine;
    actorId: string;
}
/**
 * Command 4 - UpdateAssumptions
 */
export interface UpdateAssumptionsCommand {
    type: 'UpdateAssumptions';
    tenantId: string;
    projectId: string;
    version: number;
    assumptions: EconomicAssumptions;
    actorId: string;
}
/**
 * Command 5 - RunSimulation
 */
export interface RunSimulationCommand {
    type: 'RunSimulation';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
}
/**
 * Command 6 - FreezeCostStructure
 */
export interface FreezeCostStructureCommand {
    type: 'FreezeCostStructure';
    tenantId: string;
    projectId: string;
    version: number;
    actorId: string;
}
/**
 * Command 7 - ValidateProject
 */
export interface ValidateProjectCommand {
    type: 'ValidateProject';
    tenantId: string;
    projectId: string;
    actorId: string;
}
/**
 * Command 8 - RejectProject
 */
export interface RejectProjectCommand {
    type: 'RejectProject';
    tenantId: string;
    projectId: string;
    reason: string;
    actorId: string;
}
//# sourceMappingURL=commands.d.ts.map