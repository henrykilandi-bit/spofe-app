/**
 * Command: ValidateProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-BUD-01
 */
export declare class ValidateProjectCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly actorId: string;
    readonly justification: string;
    readonly commandType: "ValidateProject";
    constructor(tenantId: string, projectId: string, actorId: string, justification: string);
}
//# sourceMappingURL=validate-project.command.d.ts.map