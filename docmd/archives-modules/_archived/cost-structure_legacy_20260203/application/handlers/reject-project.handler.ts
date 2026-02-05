/**
 * Handler: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */

import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { RejectProjectCommand } from '../commands/reject-project.command.js';
import { ProjectRejected, DecisionRecorded, type CostStructureEvent } from '../../domain/events/index.js';
import type { EconomicProjectRepository } from '../../infrastructure/persistence/economic-project.repository.js';
import type { DecisionRecordRepository } from '../../infrastructure/persistence/decision-record.repository.js';

export class RejectProjectHandler implements CommandHandler<RejectProjectCommand> {
  constructor(
    private readonly projectRepo: EconomicProjectRepository,
    private readonly decisionRepo: DecisionRecordRepository,
  ) {}

  async loadState(command: RejectProjectCommand): Promise<GuardianContext> {
    const [project, latestDecision] = await Promise.all([
      this.projectRepo.load(command.tenantId, command.projectId),
      this.decisionRepo.findLatestForProject(command.tenantId, command.projectId),
    ]);

    return {
      project: project ?? undefined,
      latestDecision: latestDecision ?? undefined,
    };
  }

  async handle(
    command: RejectProjectCommand,
    _state: GuardianContext,
  ): Promise<CostStructureEvent[]> {
    const now = new Date();
    const decisionId = crypto.randomUUID();

    return [
      new ProjectRejected(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          rejectedBy: command.actorId,
          rejectedAt: now,
          reason: command.reason,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
      new DecisionRecorded(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          decisionId,
          decision: 'REJECT',
          decidedBy: command.actorId,
          decidedAt: now,
          comments: command.reason,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: CostStructureEvent[]): Promise<void> {
    await Promise.all([
      this.projectRepo.saveEvents(events),
      this.decisionRepo.saveEvents(events),
    ]);
  }
}
