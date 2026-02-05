"use strict";
/**
 * Handler: RunSimulation
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * Invariant: COUT-01, COUT-CS-04, COUT-SIM-01
 *
 * ⚠️ AUCUN CALCUL ICI — Le Guardian enrichit le state avec les résultats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunSimulationHandler = void 0;
const index_js_1 = require("../../domain/events/index.js");
class RunSimulationHandler {
    constructor(costStructureRepo) {
        this.costStructureRepo = costStructureRepo;
    }
    async loadState(command) {
        const costStructure = await this.costStructureRepo.loadAggregate(command.tenantId, command.projectId, command.version);
        return {
            costStructure: costStructure ?? undefined,
        };
    }
    async handle(command, state) {
        const now = new Date();
        // ⚠️ AUCUN CALCUL ICI
        // Le Guardian a enrichi state.costStructure.simulation
        const simulation = state.costStructure.simulation;
        return [
            new index_js_1.CostStructureSimulated({
                tenantId: command.tenantId,
                projectId: command.projectId,
                version: command.version,
                totalCost: simulation.totalCost,
                variableCostRatio: simulation.variableCostRatio,
                breakEvenPoint: simulation.breakEvenPoint,
                marginAtTarget: simulation.marginAtTarget,
                scenarioResults: simulation.scenarioResults,
                simulatedAt: now,
            }, {
                actorId: command.actorId,
                version: 1,
            }),
        ];
    }
    async persist(events) {
        await this.costStructureRepo.saveEvents(events);
    }
}
exports.RunSimulationHandler = RunSimulationHandler;
//# sourceMappingURL=run-simulation.handler.js.map