/**
 * Command: AddCostLine
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-02
 */
export type CostCategory = 'VARIABLE' | 'FIXED' | 'INDIRECT';
export declare class AddCostLineCommand {
    readonly tenantId: string;
    readonly projectId: string;
    readonly version: number;
    readonly category: CostCategory;
    readonly label: string;
    readonly amount: number;
    readonly currency: string;
    readonly allocationRule: string | undefined;
    readonly actorId: string;
    readonly commandType: "AddCostLine";
    constructor(tenantId: string, projectId: string, version: number, category: CostCategory, label: string, amount: number, currency: string, allocationRule: string | undefined, actorId: string);
}
//# sourceMappingURL=add-cost-line.command.d.ts.map