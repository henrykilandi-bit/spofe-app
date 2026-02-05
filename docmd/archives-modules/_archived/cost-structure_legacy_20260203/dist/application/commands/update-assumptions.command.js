"use strict";
/**
 * Command: UpdateAssumptions
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-CS-04
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssumptionsCommand = void 0;
class UpdateAssumptionsCommand {
    constructor(tenantId, projectId, version, priceTarget, expectedVolume, capacityMax, scenarios, actorId) {
        this.tenantId = tenantId;
        this.projectId = projectId;
        this.version = version;
        this.priceTarget = priceTarget;
        this.expectedVolume = expectedVolume;
        this.capacityMax = capacityMax;
        this.scenarios = scenarios;
        this.actorId = actorId;
        this.commandType = 'UpdateAssumptions';
        if (!tenantId)
            throw new Error('TENANT_ID_REQUIRED');
        if (!projectId)
            throw new Error('PROJECT_ID_REQUIRED');
        if (priceTarget <= 0)
            throw new Error('PRICE_TARGET_MUST_BE_POSITIVE');
        if (expectedVolume <= 0)
            throw new Error('EXPECTED_VOLUME_MUST_BE_POSITIVE');
        if (capacityMax <= 0)
            throw new Error('CAPACITY_MAX_MUST_BE_POSITIVE');
        if (!actorId)
            throw new Error('ACTOR_ID_REQUIRED');
    }
}
exports.UpdateAssumptionsCommand = UpdateAssumptionsCommand;
//# sourceMappingURL=update-assumptions.command.js.map