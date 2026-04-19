"use strict";
// src/read-models/projections/StockProjection.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockProjection = void 0;
class StockProjection {
    constructor() {
        this.movements = [];
        this.quantities = new Map();
    }
    apply(event) {
        const m = event.payload;
        this.movements.push(m);
        switch (event.type) {
            case 'StockEntered':
            case 'StockAdjusted':
                this.increment(m);
                break;
            case 'StockExited':
                this.decrement(m);
                break;
            case 'StockTransferred':
                this.decrement({ ...m, depotId: m.depotId });
                this.increment({ ...m, depotId: m.targetDepotId });
                break;
        }
    }
    key(m) {
        return `${m.tenantId}::${m.productId}::${m.depotId}`;
    }
    increment(m) {
        const key = this.key(m);
        const current = this.quantities.get(key);
        const qty = (current?.quantity ?? 0) + m.quantity;
        this.quantities.set(key, {
            tenantId: m.tenantId,
            productId: m.productId,
            category: m.category,
            depotId: m.depotId,
            quantity: qty,
        });
    }
    decrement(m) {
        const key = this.key(m);
        const current = this.quantities.get(key);
        const qty = (current?.quantity ?? 0) - m.quantity;
        this.quantities.set(key, {
            tenantId: m.tenantId,
            productId: m.productId,
            category: m.category,
            depotId: m.depotId,
            quantity: qty,
        });
    }
    snapshotMovements() {
        return [...this.movements];
    }
    snapshotQuantities() {
        return Array.from(this.quantities.values());
    }
}
exports.StockProjection = StockProjection;
//# sourceMappingURL=StockProjection.js.map