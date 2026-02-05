"use strict";
/**
 * Handler: AddCostLine
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-02, COUT-CS-03
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCostLineHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class AddCostLineHandler {
    constructor(costStructureRepo) {
        this.costStructureRepo = costStructureRepo;
    }
    async loadState(command) {
        const costStructure = await this.costStructureRepo.loadAggregate(command.tenantId, command.projectId, command.version);
        return {
            costStructure: costStructure ?? undefined,
        };
    }
    async handle(command, _state) {
        const now = new Date();
        const lineId = crypto.randomUUID();
        return [
            new index_js_1.CostLineAdded({
                tenantId: command.tenantId,
                projectId: command.projectId,
                version: command.version,
                lineId,
                category: command.category,
                label: command.label,
                amount: command.amount,
                currency: command.currency,
                allocationRule: command.allocationRule,
                addedAt: now,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
        ];
    }
    async persist(events) {
        await this.costStructureRepo.saveEvents(events);
    }
}
exports.AddCostLineHandler = AddCostLineHandler;
//# sourceMappingURL=add-cost-line.handler.js.map