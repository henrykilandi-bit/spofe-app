/**
 * Handler: CreateCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-01
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { CreateCostStructureCommand } from '../commands/create-cost-structure.command.js';
import { CostStructureCreated } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';
export declare class CreateCostStructureHandler implements CommandHandler<CreateCostStructureCommand> {
    private readonly projectRepo;
    private readonly costStructureRepo;
    constructor(projectRepo: EconomicProjectRepository, costStructureRepo: CostStructureRepository);
    loadState(command: CreateCostStructureCommand): Promise<GuardianContext>;
    handle(command: CreateCostStructureCommand, _state: GuardianContext): Promise<CostStructureCreated[]>;
    persist(events: CostStructureCreated[]): Promise<void>;
}
//# sourceMappingURL=create-cost-structure.handler.d.ts.map