"use strict";
/**
 * Command: CreateEconomicProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEconomicProjectCommand = void 0;
class CreateEconomicProjectCommand {
    constructor(tenantId, projectId, name, type, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.name = name;
        this.type = type;
        this.actorId = actorId;
        this.commandType = 'CreateEconomicProject';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (!name)
            throw new Error('NAME_REQUIRED');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
    }
}
exports.CreateEconomicProjectCommand = CreateEconomicProjectCommand;
//# sourceMappingURL=create-economic-project.command.js.map