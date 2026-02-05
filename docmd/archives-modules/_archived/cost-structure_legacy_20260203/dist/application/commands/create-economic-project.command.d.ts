/**
 * Command: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 */
export declare class CreateEconomicProjectCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly name: string;
    readonly type: 'PRODUCT' | 'SERVICE';
    readonly actorId: string;
    readonly commandType: "CreateEconomicProject";
    constructor(tenantId: string, projectId: string, name: string, type: 'PRODUCT' | 'SERVICE', actorId: string);
}
//# sourceMappingURL=create-economic-project.command.d.ts.map