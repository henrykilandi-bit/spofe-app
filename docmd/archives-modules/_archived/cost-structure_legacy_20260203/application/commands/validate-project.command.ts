/**
 * Command: ValidateProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-BUD-01
 */

export class ValidateProjectCommand {
  public readonly commandType = 'ValidateProject' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly actorId: string,
    public readonly justification: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
    if (!justification) throw new Error('JUSTIFICATION_REQUIRED');
  }
}
