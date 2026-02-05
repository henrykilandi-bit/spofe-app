"use strict";
/**
 * Handler: CreateCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCostStructureHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class CreateCostStructureHandler {
    constructor(projectRepo, costStructureRepo) {
        this.projectRepo = projectRepo;
        this.costStructureRepo = costStructureRepo;
    }
    async loadState(command) {
        const project = await this.projectRepo.load(command.tenantId, command.projectId);
        return {
            project: project ?? undefined,
        };
    }
    async handle(command, _state) {
        const now = new Date();
        return [
            new index_js_1.CostStructureCreated({
                tenantId: command.tenantId,
                projectId: command.projectId,
                version: command.version,
                createdBy: command.actorId,
                createdAt: now,
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
exports.CreateCostStructureHandler = CreateCostStructureHandler;
//# sourceMappingURL=create-cost-structure.handler.js.map