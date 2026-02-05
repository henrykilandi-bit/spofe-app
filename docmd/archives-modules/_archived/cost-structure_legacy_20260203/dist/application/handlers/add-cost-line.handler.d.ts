/**
 * Handler: AddCostLine
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-02, COUT-CS-03
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { AddCostLineCommand } from '../commands/add-cost-line.command.js';
import { CostLineAdded } from '../../domain/events/index.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';
export declare class AddCostLineHandler implements CommandHandler<AddCostLineCommand> {
    private readonly costStructureRepo;
    constructor(costStructureRepo: CostStructureRepository);
    loadState(command: AddCostLineCommand): Promise<GuardianContext>;
    handle(command: AddCostLineCommand, _state: GuardianContext): Promise<CostLineAdded[]>;
    persist(events: CostLineAdded[]): Promise<void>;
}
//# sourceMappingURL=add-cost-line.handler.d.ts.map