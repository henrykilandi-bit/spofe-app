/**
 * Command: AddCostLine
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-02
 */

export type CostCategory = 'VARIABLE' | 'FIXED' | 'INDIRECT';

export class AddCostLineCommand {
  public readonly commandType = 'AddCostLine' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly version: number,
    public readonly category: CostCategory,
    public readonly label: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly allocationRule: string | undefined,
    public readonly actorId: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (!label) throw new Error('LABEL_REQUIRED');
    if (amount <= 0) throw new Error('AMOUNT_MUST_BE_POSITIVE');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
  }
}
