/**
 * Command: UpdateAssumptions
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-04
 */

export interface ScenarioSet {
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

export class UpdateAssumptionsCommand {
  public readonly commandType = 'UpdateAssumptions' as const;

  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly version: number,
    public readonly priceTarget: number,
    public readonly expectedVolume: number,
    public readonly capacityMax: number,
    public readonly scenarios: ScenarioSet,
    public readonly actorId: string,
  ) {
    if (!tenantId) throw new Error('TENANT_ID_REQUIRED');
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    if (priceTarget <= 0) throw new Error('PRICE_TARGET_MUST_BE_POSITIVE');
    if (expectedVolume <= 0) throw new Error('EXPECTED_VOLUME_MUST_BE_POSITIVE');
    if (capacityMax <= 0) throw new Error('CAPACITY_MAX_MUST_BE_POSITIVE');
    if (!actorId) throw new Error('ACTOR_ID_REQUIRED');
  }
}
