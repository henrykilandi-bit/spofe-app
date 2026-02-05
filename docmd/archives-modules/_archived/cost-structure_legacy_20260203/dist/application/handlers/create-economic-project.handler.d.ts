/**
 * Handler: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-EP-01
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { CreateEconomicProjectCommand } from '../commands/create-economic-project.command.js';
import { EconomicProjectCreated } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
export declare class CreateEconomicProjectHandler implements CommandHandler<CreateEconomicProjectCommand> {
    private readonly projectRepo;
    constructor(projectRepo: EconomicProjectRepository);
    loadState(command: CreateEconomicProjectCommand): Promise<GuardianContext>;
    handle(command: CreateEconomicProjectCommand, _state: GuardianContext): Promise<EconomicProjectCreated[]>;
    persist(events: EconomicProjectCreated[]): Promise<void>;
}
//# sourceMappingURL=create-economic-project.handler.d.ts.map