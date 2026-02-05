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

export class FreezeCostStructureHandler implements CommandHandler<FreezeCostStructureCommand> {
  constructor(
    private readonly costStructureRepo: CostStructureRepository,
    private readonly projectRepo: EconomicProjectRepository,
  ) {}

  async loadState(command: FreezeCostStructureCommand): Promise<GuardianContext> {
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
    command: FreezeCostStructureCommand,
    state: GuardianContext,
  ): Promise<CostStructureFrozen[]> {
    const now = new Date();
    const simulation = state.costStructure!.simulation!;

    return [
      new CostStructureFrozen(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          version: command.version,
          frozenBy: command.actorId,
          frozenAt: now,
          finalTotalCost: simulation.totalCost,
          finalVariableCostRatio: simulation.variableCostRatio,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: CostStructureFrozen[]): Promise<void> {
    // Save to both repositories to update CostStructure AND Project status
    await Promise.all([
      this.costStructureRepo.saveEvents(events),
      this.projectRepo.saveEvents(events),
    ]);
  }
}
