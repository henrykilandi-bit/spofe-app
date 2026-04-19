import { PreAccountingDocumentRM, PreAccountingStatusRM, PreAccountingAnalyticsRM, PreAccountingExposureRM } from '../types';
export declare class PrecomptabiliteProjection {
    private documents;
    private statuses;
    private analytics;
    apply(event: any): void;
    private updateStatus;
    snapshotDocuments(): PreAccountingDocumentRM[];
    snapshotStatuses(): PreAccountingStatusRM[];
    snapshotAnalytics(): PreAccountingAnalyticsRM[];
    snapshotExposure(): PreAccountingExposureRM[];
}
//# sourceMappingURL=PrecomptabiliteProjection.d.ts.map