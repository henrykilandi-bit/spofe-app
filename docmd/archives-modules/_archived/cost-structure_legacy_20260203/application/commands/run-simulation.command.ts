/**
 * Command: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01 (test 70%)
 */

export class RunSimulationCommand {
  public readonly commandType = 'RunSimulation' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly version: number,
    public readonly actorId: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (version < 1) throw new Error('VERSION_MUST_BE_POSITIVE');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
  }
}
