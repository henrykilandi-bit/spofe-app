/**
 * Handler: ValidateProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02, COUT-BUD-01
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { ValidateProjectCommand } from '../commands/validate-project.command.js';
import { type CostStructureEvent } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
import type { DecisionRecordRepository } from '../../infrastructure/persistence/decision-record.repository.js';
export declare class ValidateProjectHandler implements CommandHandler<ValidateProjectCommand> {
    private readonly projectRepo;
    private readonly decisionRepo;
    constructor(projectRepo: EconomicProjectRepository, decisionRepo: DecisionRecordRepository);
    loadState(command: ValidateProjectCommand): Promise<GuardianContext>;
    handle(command: ValidateProjectCommand, _state: GuardianContext): Promise<CostStructureEvent[]>;
    persist(events: CostStructureEvent[]): Promise<void>;
}
//# sourceMappingURL=validate-project.handler.d.ts.map