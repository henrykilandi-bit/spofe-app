import { StockMovementRM, StockQuantityRM } from '../types';
export interface StockReadRepository {
    getMovements(tenantId: string): Promise<StockMovementRM[]>;
    getStockByDepot(tenantId: string): Promise<StockQuantityRM[]>;
    getStockByProduct(tenantId: string): Promise<StockQuantityRM[]>;
    getStockByCategory(tenantId: string): Promise<StockQuantityRM[]>;
}
//# sourceMappingURL=StockReadRepository.d.ts.map