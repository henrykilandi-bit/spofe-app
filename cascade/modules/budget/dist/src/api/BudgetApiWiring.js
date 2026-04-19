"use strict";
// src/api/BudgetApiWiring.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBudgetReadApi = createBudgetReadApi;
const BudgetReadController_1 = require("./BudgetReadController");
const BudgetProjection_1 = require("../read-models/projections/BudgetProjection");
const InMemoryBudgetReadRepository_1 = require("../read-models/repositories/InMemoryBudgetReadRepository");
function createBudgetReadApi(events) {
    const projection = new BudgetProjection_1.BudgetProjection();
    for (const event of events) {
        projection.apply(event);
    }
    const repo = new InMemoryBudgetReadRepository_1.InMemoryBudgetReadRepository(projection.snapshotObjectives(), projection.snapshotCashflows(), projection.snapshotVariances(), projection.snapshotTimelines(), projection.snapshotAlerts());
    return new BudgetReadController_1.BudgetReadController(repo);
}
//# sourceMappingURL=BudgetApiWiring.js.map