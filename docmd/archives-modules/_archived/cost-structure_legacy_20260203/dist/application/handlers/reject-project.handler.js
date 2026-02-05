"use strict";
/**
 * Handler: RejectProject
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-DEC-01, COUT-DEC-02
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectProjectHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class RejectProjectHandler {
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
            new index_js_1.ProjectRejected({
                tenantId: command.tenantId,
                projectId: command.projectId,
                rejectedBy: command.actorId,
                rejectedAt: now,
                reason: command.reason,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
            new index_js_1.DecisionRecorded({
                tenantId: command.tenantId,
                projectId: command.projectId,
                decisionId,
                decision: 'REJECT',
                decidedBy: command.actorId,
                decidedAt: now,
                comments: command.reason,
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
exports.RejectProjectHandler = RejectProjectHandler;
//# sourceMappingURL=reject-project.handler.js.map