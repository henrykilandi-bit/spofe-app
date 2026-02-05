"use strict";
/**
 * Command: FreezeCostStructure
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-SIM-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeCostStructureCommand = void 0;
class FreezeCostStructureCommand {
    constructor(tenantId, projectId, version, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.version = version;
        this.actorId = actorId;
        this.commandType = 'FreezeCostStructure';
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
exports.FreezeCostStructureCommand = FreezeCostStructureCommand;
//# sourceMappingURL=freeze-cost-structure.command.js.map