"use strict";
// src/api/StockApiWiring.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockReadApi = createStockReadApi;
const StockReadController_1 = require("./StockReadController");
const StockProjection_1 = require("../read-models/projections/StockProjection");
const InMemoryStockReadRepository_1 = require("../read-models/repositories/InMemoryStockReadRepository");
function createStockReadApi(events) {
    const projection = new StockProjection_1.StockProjection();
    for (const event of events) {
        projection.apply(event);
    }
    const repo = new InMemoryStockReadRepository_1.InMemoryStockReadRepository(projection.snapshotMovements(), projection.snapshotQuantities());
    return new StockReadController_1.StockReadController(repo);
}
//# sourceMappingURL=StockApiWiring.js.map