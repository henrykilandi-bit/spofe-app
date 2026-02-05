"use strict";
/**
 * Command: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectProjectCommand = void 0;
class RejectProjectCommand {
    constructor(tenantId, projectId, actorId, reason) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.actorId = actorId;
        this.reason = reason;
        this.commandType = 'RejectProject';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
        if (!reason)
            throw new Error('REASON_REQUIRED');
    }
}
exports.RejectProjectCommand = RejectProjectCommand;
//# sourceMappingURL=reject-project.command.js.map