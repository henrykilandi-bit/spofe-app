/**
 * Handler: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-CS-04, COUT-SIM-01
 *
 * ⚠️ AUCUN CALCUL ICI — Le Guardian enrichit le state avec les résultats
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { RunSimulationCommand } from '../commands/run-simulation.command.js';
import { CostStructureSimulated } from '../../domain/events/index.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';
export declare class RunSimulationHandler implements CommandHandler<RunSimulationCommand> {
    private readonly costStructureRepo;
    constructor(costStructureRepo: CostStructureRepository);
    loadState(command: RunSimulationCommand): Promise<GuardianContext>;
    handle(command: RunSimulationCommand, state: GuardianContext): Promise<CostStructureSimulated[]>;
    persist(events: CostStructureSimulated[]): Promise<void>;
}
//# sourceMappingURL=run-simulation.handler.d.ts.map