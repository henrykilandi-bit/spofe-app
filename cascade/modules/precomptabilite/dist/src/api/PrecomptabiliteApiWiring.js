"use strict";
// src/api/PrecomptabiliteApiWiring.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrecomptabiliteReadApi = createPrecomptabiliteReadApi;
const PrecomptabiliteReadController_1 = require("./PrecomptabiliteReadController");
const PrecomptabiliteProjection_1 = require("../read-models/projections/PrecomptabiliteProjection");
const InMemoryPrecomptabiliteReadRepository_1 = require("../read-models/repositories/InMemoryPrecomptabiliteReadRepository");
function createPrecomptabiliteReadApi(events) {
    const projection = new PrecomptabiliteProjection_1.PrecomptabiliteProjection();
    for (const event of events) {
        projection.apply(event);
    }
    const repo = new InMemoryPrecomptabiliteReadRepository_1.InMemoryPrecomptabiliteReadRepository(projection.snapshotDocuments(), projection.snapshotStatuses(), projection.snapshotAnalytics(), projection.snapshotExposure());
    return new PrecomptabiliteReadController_1.PrecomptabiliteReadController(repo);
}
//# sourceMappingURL=PrecomptabiliteApiWiring.js.map