/**
 * Command: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01 (test 70%)
 */
export declare class RunSimulationCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly version: number;
    readonly actorId: string;
    readonly commandType: "RunSimulation";
    constructor(tenantId: string, projectId: string, version: number, actorId: string);
}
//# sourceMappingURL=run-simulation.command.d.ts.map