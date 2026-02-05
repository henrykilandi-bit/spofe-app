/**
 * Handler: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-CS-04, COUT-SIM-01
 * 
 * ⚠️ AUCUN CALCUL ICI — Le Guardian enrichit le state avec les résultats
 */

import type { CommandHandler } from '../transaction/cost-structure.transaction-manager.js';
import type { GuardianContext } from '../../domain/guardian/cost-structure.guardian.js';
import { RunSimulationCommand } from '../commands/run-simulation.command.js';
import { CostStructureSimulated } from '../../domain/events/index.js';
import type { CostStructureRepository } from '../../infrastructure/persistence/cost-structure.repository.js';

export class RunSimulationHandler implements CommandHandler<RunSimulationCommand> {
  constructor(
    private readonly costStructureRepo: CostStructureRepository,
  ) {}

  async loadState(command: RunSimulationCommand): Promise<GuardianContext> {
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
    command: RunSimulationCommand,
    state: GuardianContext,
  ): Promise<CostStructureSimulated[]> {
    const now = new Date();

    // ⚠️ AUCUN CALCUL ICI
    // Le Guardian a enrichi state.costStructure.simulation
    const simulation = state.costStructure!.simulation!;

    return [
      new CostStructureSimulated(
        {
          tenantId: command.tenantId,
          projectId: command.projectId,
          version: command.version,
          totalCost: simulation.totalCost,
          variableCostRatio: simulation.variableCostRatio,
          breakEvenPoint: simulation.breakEvenPoint,
          marginAtTarget: simulation.marginAtTarget,
          scenarioResults: simulation.scenarioResults,
          simulatedAt: now,
        },
        {
          actorId: command.actorId,
          version: 1,
        },
      ),
    ];
  }

  async persist(events: CostStructureSimulated[]): Promise<void> {
    await this.costStructureRepo.saveEvents(events);
  }
}
