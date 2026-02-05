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
export declare class UpdateAssumptionsCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly version: number;
    readonly priceTarget: number;
    readonly expectedVolume: number;
    readonly capacityMax: number;
    readonly scenarios: ScenarioSet;
    readonly actorId: string;
    readonly commandType: "UpdateAssumptions";
    constructor(tenantId: string, projectId: string, version: number, priceTarget: number, expectedVolume: number, capacityMax: number, scenarios: ScenarioSet, actorId: string);
}
//# sourceMappingURL=update-assumptions.command.d.ts.map