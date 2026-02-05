"use strict";
/**
 * Handler: FreezeCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-SIM-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeCostStructureHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class FreezeCostStructureHandler {
    constructor(costStructureRepo, projectRepo) {
        this.costStructureRepo = costStructureRepo;
        this.projectRepo = projectRepo;
    }
    async loadState(command) {
        const costStructure = await this.costStructureRepo.loadAggregate(command.tenantId, command.projectId, command.version);
        return {
            costStructure: costStructure ?? undefined,
        };
    }
    async handle(command, state) {
        const now = new Date();
        const simulation = state.costStructure.simulation;
        return [
            new index_js_1.CostStructureFrozen({
                tenantId: command.tenantId,
                projectId: command.projectId,
                version: command.version,
                frozenBy: command.actorId,
                frozenAt: now,
                finalTotalCost: simulation.totalCost,
                finalVariableCostRatio: simulation.variableCostRatio,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
        ];
    }
    async persist(events) {
        // Save to both repositories to update CostStructure AND Project status
        await Promise.all([
            this.costStructureRepo.saveEvents(events),
            this.projectRepo.saveEvents(events),
        ]);
    }
}
exports.FreezeCostStructureHandler = FreezeCostStructureHandler;
//# sourceMappingURL=freeze-cost-structure.handler.js.map