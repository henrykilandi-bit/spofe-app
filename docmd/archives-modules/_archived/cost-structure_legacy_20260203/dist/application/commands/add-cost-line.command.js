"use strict";
/**
 * Command: AddCostLine
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCostLineCommand = void 0;
class AddCostLineCommand {
    constructor(tenantId, projectId, version, category, label, amount, currency, allocationRule, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.version = version;
        this.category = category;
        this.label = label;
        this.amount = amount;
        this.currency = currency;
        this.allocationRule = allocationRule;
        this.actorId = actorId;
        this.commandType = 'AddCostLine';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (!label)
            throw new Error('LABEL_REQUIRED');
        if (amount <= 0)
            throw new Error('AMOUNT_MUST_BE_POSITIVE');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
    }
}
exports.AddCostLineCommand = AddCostLineCommand;
//# sourceMappingURL=add-cost-line.command.js.map