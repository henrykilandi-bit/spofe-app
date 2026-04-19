import {
  PreAccountingDocumentRM,
  PreAccountingStatusRM,
  PreAccountingAnalyticsRM,
  PreAccountingExposureRM,
} from '../types';

export interface PrecomptabiliteReadRepository {
  getDocuments(tenantId: string): PreAccountingDocumentRM[];
  getStatuses(tenantId: string): PreAccountingStatusRM[];
  getAnalytics(tenantId: string): PreAccountingAnalyticsRM[];
  getExposure(tenantId: string): PreAccountingExposureRM[];
}
