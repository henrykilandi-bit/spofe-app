/**
 * Handler: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-EP-01
 */

import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext, EconomicProjectState } from '../../domain/guardian/cost-structure.guardian.js';
import { CreateEconomicProjectCommand } from '../commands/create-economic-project.command.js';
import { EconomicProjectCreated } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';

export class CreateEconomicProjectHandler implements CommandHandler<CreateEconomicProjectCommand> {
  constructor(
    private readonly projectRepo: EconomicProjectRepository,
  ) {}

  async loadState(command: CreateEconomicProjectCommand): Promise<GuardianContext> {
    // Load existing project with same name (for uniqueness check)
    const existingProjectByName = await this.projectRepo.findByName(
      command.tenantId,
      command.name,
    );

    return {
      existingProjectByName: existingProjectByName ?? undefined,
    };
  }

  async handle(
    command: CreateEconomicProjectCommand,
    _state: GuardianContext,
  ): Promise<EconomicProjectCreated[]> {
    const now = new Date();

    return [
      new EconomicProjectCreated(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          name: command.name,
          type: command.type,
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

  async persist(events: EconomicProjectCreated[]): Promise<void> {
    await this.projectRepo.saveEvents(events);
  }
}
