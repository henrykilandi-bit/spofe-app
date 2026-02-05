"use strict";
/**
 * Command: ValidateProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-BUD-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateProjectCommand = void 0;
class ValidateProjectCommand {
    constructor(tenantId, projectId, actorId, justification) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.actorId = actorId;
        this.justification = justification;
        this.commandType = 'ValidateProject';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
        if (!justification)
            throw new Error('JUSTIFICATION_REQUIRED');
    }
}
exports.ValidateProjectCommand = ValidateProjectCommand;
//# sourceMappingURL=validate-project.command.js.map