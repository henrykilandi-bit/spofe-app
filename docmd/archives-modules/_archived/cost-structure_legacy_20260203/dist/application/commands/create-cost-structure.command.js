"use strict";
/**
 * Command: CreateCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCostStructureCommand = void 0;
class CreateCostStructureCommand {
    constructor(tenantId, projectId, version, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.version = version;
        this.actorId = actorId;
        this.commandType = 'CreateCostStructure';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (version < 1)
            throw new Error('VERSION_MUST_BE_POSITIVE');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
    }
}
exports.CreateCostStructureCommand = CreateCostStructureCommand;
//# sourceMappingURL=create-cost-structure.command.js.map