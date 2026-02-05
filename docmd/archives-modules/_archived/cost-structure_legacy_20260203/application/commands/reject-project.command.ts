/**
 * Command: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */

export class RejectProjectCommand {
  public readonly commandType = 'RejectProject' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly actorId: string,
    public readonly reason: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
    if (!reason) throw new Error('REASON_REQUIRED');
  }
}
