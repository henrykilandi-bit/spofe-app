/**
 * Command: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 */

export class CreateEconomicProjectCommand {
  public readonly commandType = 'CreateEconomicProject' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly type: 'PRODUCT' | 'SERVICE',
    public readonly actorId: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (!name) throw new Error('NAME_REQUIRED');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
  }
}
