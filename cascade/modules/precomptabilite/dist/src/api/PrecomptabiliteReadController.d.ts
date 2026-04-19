import { ApiRequest, ApiResponse } from './types';
import { PrecomptabiliteReadRepository } from '../read-models/ports/PrecomptabiliteReadRepository';
import { PreAccountingDocumentRM, PreAccountingStatusRM, PreAccountingAnalyticsRM, PreAccountingExposureRM } from '../read-models/types';
export declare class PrecomptabiliteReadController {
    private readonly repo;
    constructor(repo: PrecomptabiliteReadRepository);
    getDocuments(req: ApiRequest): Promise<ApiResponse<PreAccountingDocumentRM[]>>;
    getStatuses(req: ApiRequest): Promise<ApiResponse<PreAccountingStatusRM[]>>;
    getAnalytics(req: ApiRequest): Promise<ApiResponse<PreAccountingAnalyticsRM[]>>;
    getExposure(req: ApiRequest): Promise<ApiResponse<PreAccountingExposureRM[]>>;
}
//# sourceMappingURL=PrecomptabiliteReadController.d.ts.map