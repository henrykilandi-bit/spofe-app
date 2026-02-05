/**
 * Command: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */
export declare class RejectProjectCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly actorId: string;
    readonly reason: string;
    readonly commandType: "RejectProject";
    constructor(tenantId: string, projectId: string, actorId: string, reason: string);
}
//# sourceMappingURL=reject-project.command.d.ts.map