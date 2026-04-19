import { PrecomptabiliteReadRepository } from '../ports/PrecomptabiliteReadRepository';
import { PreAccountingDocumentRM, PreAccountingStatusRM, PreAccountingAnalyticsRM, PreAccountingExposureRM } from '../types';
export declare class InMemoryPrecomptabiliteReadRepository implements PrecomptabiliteReadRepository {
    private readonly documents;
    private readonly statuses;
    private readonly analytics;
    private readonly exposure;
    constructor(documents: PreAccountingDocumentRM[], statuses: PreAccountingStatusRM[], analytics: PreAccountingAnalyticsRM[], exposure: PreAccountingExposureRM[]);
    getDocuments(tenantId: string): PreAccountingDocumentRM[];
    getStatuses(tenantId: string): PreAccountingStatusRM[];
    getAnalytics(tenantId: string): PreAccountingAnalyticsRM[];
    getExposure(tenantId: string): PreAccountingExposureRM[];
}
//# sourceMappingURL=InMemoryPrecomptabiliteReadRepository.d.ts.map