import { ApiRequest, ApiResponse } from './types';
import { StockReadRepository } from '../read-models/ports/StockReadRepository';
import { StockMovementRM, StockQuantityRM } from '../read-models/types';
export declare class StockReadController {
    private readonly repo;
    constructor(repo: StockReadRepository);
    getMovements(req: ApiRequest): Promise<ApiResponse<StockMovementRM[]>>;
    getStockByDepot(req: ApiRequest): Promise<ApiResponse<StockQuantityRM[]>>;
    getStockByProduct(req: ApiRequest): Promise<ApiResponse<StockQuantityRM[]>>;
    getStockByCategory(req: ApiRequest): Promise<ApiResponse<StockQuantityRM[]>>;
}
//# sourceMappingURL=StockReadController.d.ts.map