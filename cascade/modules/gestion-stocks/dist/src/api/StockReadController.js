"use strict";
// src/api/StockReadController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockReadController = void 0;
class StockReadController {
    constructor(repo) {
        this.repo = repo;
    }
    async getMovements(req) {
        const data = await this.repo.getMovements(req.tenantId);
        return { status: 200, body: data };
    }
    async getStockByDepot(req) {
        const data = await this.repo.getStockByDepot(req.tenantId);
        return { status: 200, body: data };
    }
    async getStockByProduct(req) {
        const data = await this.repo.getStockByProduct(req.tenantId);
        return { status: 200, body: data };
    }
    async getStockByCategory(req) {
        const data = await this.repo.getStockByCategory(req.tenantId);
        return { status: 200, body: data };
    }
}
exports.StockReadController = StockReadController;
//# sourceMappingURL=StockReadController.js.map