"use strict";
/**
 * Handler: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-EP-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEconomicProjectHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class CreateEconomicProjectHandler {
    constructor(projectRepo) {
        this.projectRepo = projectRepo;
    }
    async loadState(command) {
        // Load existing project with same name (for uniqueness check)
        const existingProjectByName = await this.projectRepo.findByName(command.tenantId, command.name);
        return {
            existingProjectByName: existingProjectByName ?? undefined,
        };
    }
    async handle(command, _state) {
        const now = new Date();
        return [
            new index_js_1.EconomicProjectCreated({
                tenantId: command.tenantId,
                projectId: command.projectId,
                name: command.name,
                type: command.type,
                createdBy: command.actorId,
                createdAt: now,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
        ];
    }
    async persist(events) {
        await this.projectRepo.saveEvents(events);
    }
}
exports.CreateEconomicProjectHandler = CreateEconomicProjectHandler;
//# sourceMappingURL=create-economic-project.handler.js.map