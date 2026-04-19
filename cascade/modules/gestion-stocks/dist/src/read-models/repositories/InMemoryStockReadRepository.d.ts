import { StockReadRepository } from '../ports/StockReadRepository';
import { StockMovementRM, StockQuantityRM } from '../types';
export declare class InMemoryStockReadRepository implements StockReadRepository {
    private readonly movements;
    private readonly quantities;
    constructor(movements: StockMovementRM[], quantities: StockQuantityRM[]);
    getMovements(tenantId: string): Promise<StockMovementRM[]>;
    getStockByDepot(tenantId: string): Promise<StockQuantityRM[]>;
    getStockByProduct(tenantId: string): Promise<StockQuantityRM[]>;
    getStockByCategory(tenantId: string): Promise<StockQuantityRM[]>;
}
//# sourceMappingURL=InMemoryStockReadRepository.d.ts.map