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

export class CreateCostStructureHandler implements CommandHandler<CreateCostStructureCommand> {
  constructor(
    private readonly projectRepo: EconomicProjectRepository,
    private readonly costStructureRepo: CostStructureRepository,
  ) {}

  async loadState(command: CreateCostStructureCommand): Promise<GuardianContext> {
    const project = await this.projectRepo.load(
      command.tenantId,
      command.projectId,
    );

    return {
      project: project ?? undefined,
    };
  }

  async handle(
    command: CreateCostStructureCommand,
    _state: GuardianContext,
  ): Promise<CostStructureCreated[]> {
    const now = new Date();

    return [
      new CostStructureCreated(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          version: command.version,
          createdBy: command.actorId,
          createdAt: now,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: CostStructureCreated[]): Promise<void> {
    await this.costStructureRepo.saveEvents(events);
  }
}
