"use strict";
/**
 * Handler: UpdateAssumptions
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-03, COUT-CS-04
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssumptionsHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class UpdateAssumptionsHandler {
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
        return [
            new index_js_1.AssumptionsUpdated({
                tenantId: command.tenantId,
                projectId: command.projectId,
                version: command.version,
                priceTarget: command.priceTarget,
                expectedVolume: command.expectedVolume,
                capacityMax: command.capacityMax,
                scenarios: command.scenarios,
                updatedAt: now,
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
exports.UpdateAssumptionsHandler = UpdateAssumptionsHandler;
//# sourceMappingURL=update-assumptions.handler.js.map