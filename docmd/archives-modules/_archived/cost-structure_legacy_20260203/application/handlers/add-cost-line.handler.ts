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

export class AddCostLineHandler implements CommandHandler<AddCostLineCommand> {
  constructor(
    private readonly costStructureRepo: CostStructureRepository,
  ) {}

  async loadState(command: AddCostLineCommand): Promise<GuardianContext> {
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
    command: AddCostLineCommand,
    _state: GuardianContext,
  ): Promise<CostLineAdded[]> {
    const now = new Date();
    const lineId = crypto.randomUUID();

    return [
      new CostLineAdded(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          version: command.version,
          lineId,
          category: command.category,
          label: command.label,
          amount: command.amount,
          currency: command.currency,
          allocationRule: command.allocationRule,
          addedAt: now,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: CostLineAdded[]): Promise<void> {
    await this.costStructureRepo.saveEvents(events);
  }
}
