/**
 * Handler: FreezeCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-SIM-02
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { FreezeCostStructureCommand } from '../commands/freeze-cost-structure.command.js';
import { CostStructureFrozen } from '../../domain/events/index.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
export declare class FreezeCostStructureHandler implements CommandHandler<FreezeCostStructureCommand> {
    private readonly costStructureRepo;
    private readonly projectRepo;
    constructor(costStructureRepo: CostStructureRepository, projectRepo: EconomicProjectRepository);
    loadState(command: FreezeCostStructureCommand): Promise<GuardianContext>;
    handle(command: FreezeCostStructureCommand, state: GuardianContext): Promise<CostStructureFrozen[]>;
    persist(events: CostStructureFrozen[]): Promise<void>;
}
//# sourceMappingURL=freeze-cost-structure.handler.d.ts.map