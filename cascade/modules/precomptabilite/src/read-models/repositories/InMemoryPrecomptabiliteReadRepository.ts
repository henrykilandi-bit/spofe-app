import { PrecomptabiliteReadRepository } from '../ports/PrecomptabiliteReadRepository';
import {
  PreAccountingDocumentRM,
  PreAccountingStatusRM,
  PreAccountingAnalyticsRM,
  PreAccountingExposureRM,
} from '../types';

export class InMemoryPrecomptabiliteReadRepository
  implements PrecomptabiliteReadRepository {

  constructor(
    private readonly documents: PreAccountingDocumentRM[],
    private readonly statuses: PreAccountingStatusRM[],
    private readonly analytics: PreAccountingAnalyticsRM[],
    private readonly exposure: PreAccountingExposureRM[]
  ) {}

  getDocuments(tenantId: string) {
    return this.documents.filter(d => d.tenantId === tenantId);
  }

  getStatuses(tenantId: string) {
    return this.statuses.filter(s => s.tenantId === tenantId);
  }

  getAnalytics(tenantId: string) {
    return this.analytics.filter(a => a.tenantId === tenantId);
  }

  getExposure(tenantId: string) {
    return this.exposure.filter(e => e.tenantId === tenantId);
  }
}
