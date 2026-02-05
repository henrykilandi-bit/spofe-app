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

export class UpdateAssumptionsHandler implements CommandHandler<UpdateAssumptionsCommand> {
  constructor(
    private readonly costStructureRepo: CostStructureRepository,
  ) {}

  async loadState(command: UpdateAssumptionsCommand): Promise<GuardianContext> {
    const costStructure = await this.costStructureRepo.loadAggregate(
      command.tenantId,
      command.projectId,
      command.version,
    );

    return {
      costStructure: costStructure ?? undefined,
    };
  }

  async handle(
    command: UpdateAssumptionsCommand,
    _state: GuardianContext,
  ): Promise<AssumptionsUpdated[]> {
    const now = new Date();

    return [
      new AssumptionsUpdated(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          version: command.version,
          priceTarget: command.priceTarget,
          expectedVolume: command.expectedVolume,
          capacityMax: command.capacityMax,
          scenarios: command.scenarios,
          updatedAt: now,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: AssumptionsUpdated[]): Promise<void> {
    await this.costStructureRepo.saveEvents(events);
  }
}
