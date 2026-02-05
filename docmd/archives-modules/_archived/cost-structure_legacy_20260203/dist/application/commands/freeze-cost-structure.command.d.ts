/**
 * Command: FreezeCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-SIM-02
 */
export declare class FreezeCostStructureCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly version: number;
    readonly actorId: string;
    readonly commandType: "FreezeCostStructure";
    constructor(tenantId: string, projectId: string, version: number, actorId: string);
}
//# sourceMappingURL=freeze-cost-structure.command.d.ts.map