"use strict";
/**
 * Command: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01 (test 70%)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunSimulationCommand = void 0;
class RunSimulationCommand {
    constructor(tenantId, projectId, version, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.version = version;
        this.actorId = actorId;
        this.commandType = 'RunSimulation';
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
exports.RunSimulationCommand = RunSimulationCommand;
//# sourceMappingURL=run-simulation.command.js.map