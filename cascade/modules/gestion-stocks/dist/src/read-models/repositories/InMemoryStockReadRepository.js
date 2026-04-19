"use strict";
// src/read-models/repositories/InMemoryStockReadRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStockReadRepository = void 0;
class InMemoryStockReadRepository {
    constructor(movements, quantities) {
        this.movements = movements;
        this.quantities = quantities;
    }
    async getMovements(tenantId) {
        return this.movements.filter((m) => m.tenantId === tenantId);
    }
    async getStockByDepot(tenantId) {
        return this.quantities.filter((q) => q.tenantId === tenantId);
    }
    async getStockByProduct(tenantId) {
        return this.quantities.filter((q) => q.tenantId === tenantId);
    }
    async getStockByCategory(tenantId) {
        return this.quantities.filter((q) => q.tenantId === tenantId);
    }
}
exports.InMemoryStockReadRepository = InMemoryStockReadRepository;
//# sourceMappingURL=InMemoryStockReadRepository.js.map