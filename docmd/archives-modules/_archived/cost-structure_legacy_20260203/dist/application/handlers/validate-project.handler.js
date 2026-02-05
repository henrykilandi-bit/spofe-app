"use strict";
/**
 * Handler: ValidateProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02, COUT-BUD-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateProjectHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class ValidateProjectHandler {
    constructor(projectRepo, decisionRepo) {
        this.projectRepo = projectRepo;
        this.decisionRepo = decisionRepo;
    }
    async loadState(command) {
        const [project, latestDecision] = await Promise.all([
            this.projectRepo.load(command.tenantId, command.projectId),
            this.decisionRepo.findLatestForProject(command.tenantId, command.projectId),
        ]);
        return {
            project: project ?? undefined,
            latestDecision: latestDecision ?? undefined,
        };
    }
    async handle(command, _state) {
        const now = new Date();
        const decisionId = crypto.randomUUID();
        return [
            new index_js_1.ProjectValidated({
                tenantId: command.tenantId,
                projectId: command.projectId,
                validatedBy: command.actorId,
                validatedAt: now,
                justification: command.justification,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
            new index_js_1.DecisionRecorded({
                tenantId: command.tenantId,
                projectId: command.projectId,
                decisionId,
                decision: 'VALIDATE',
                decidedBy: command.actorId,
                decidedAt: now,
                comments: command.justification,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
        ];
    }
    async persist(events) {
        await Promise.all([
            this.projectRepo.saveEvents(events),
            this.decisionRepo.saveEvents(events),
        ]);
    }
}
exports.ValidateProjectHandler = ValidateProjectHandler;
//# sourceMappingURL=validate-project.handler.js.map