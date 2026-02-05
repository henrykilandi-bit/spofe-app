/**
 * Handler: UpdateAssumptions
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-03, COUT-CS-04
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { UpdateAssumptionsCommand } from '../commands/update-assumptions.command.js';
import { AssumptionsUpdated } from '../../domain/events/index.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';
export declare class UpdateAssumptionsHandler implements CommandHandler<UpdateAssumptionsCommand> {
    private readonly costStructureRepo;
    constructor(costStructureRepo: CostStructureRepository);
    loadState(command: UpdateAssumptionsCommand): Promise<GuardianContext>;
    handle(command: UpdateAssumptionsCommand, _state: GuardianContext): Promise<AssumptionsUpdated[]>;
    persist(events: AssumptionsUpdated[]): Promise<void>;
}
//# sourceMappingURL=update-assumptions.handler.d.ts.map