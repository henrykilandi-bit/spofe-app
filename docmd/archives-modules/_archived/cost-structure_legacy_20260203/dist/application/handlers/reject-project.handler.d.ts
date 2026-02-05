/**
 * Handler: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */
import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { RejectProjectCommand } from '../commands/reject-project.command.js';
import { type CostStructureEvent } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
import type { DecisionRecordRepository } from '../../infrastructure/persistence/decision-record.repository.js';
export declare class RejectProjectHandler implements CommandHandler<RejectProjectCommand> {
    private readonly projectRepo;
    private readonly decisionRepo;
    constructor(projectRepo: EconomicProjectRepository, decisionRepo: DecisionRecordRepository);
    loadState(command: RejectProjectCommand): Promise<GuardianContext>;
    handle(command: RejectProjectCommand, _state: GuardianContext): Promise<CostStructureEvent[]>;
    persist(events: CostStructureEvent[]): Promise<void>;
}
//# sourceMappingURL=reject-project.handler.d.ts.map