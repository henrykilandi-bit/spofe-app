import { ApiRequest, ApiResponse } from './types';
import { BudgetReadRepository } from '../read-models/ports/BudgetReadRepository';
import { BudgetObjectiveRM, BudgetCashflowRM, BudgetVarianceRM, BudgetTimelineRM, BudgetAlertRM } from '../read-models/types';
export declare class BudgetReadController {
    private readonly repo;
    constructor(repo: BudgetReadRepository);
    getObjectives(req: ApiRequest): Promise<ApiResponse<BudgetObjectiveRM[]>>;
    getCashflows(req: ApiRequest): Promise<ApiResponse<BudgetCashflowRM[]>>;
    getVariances(req: ApiRequest): Promise<ApiResponse<BudgetVarianceRM[]>>;
    getTimeline(req: ApiRequest): Promise<ApiResponse<BudgetTimelineRM[]>>;
    getAlerts(req: ApiRequest): Promise<ApiResponse<BudgetAlertRM[]>>;
}
//# sourceMappingURL=BudgetReadController.d.ts.map