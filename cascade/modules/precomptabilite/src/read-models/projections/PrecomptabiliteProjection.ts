import {
  PreAccountingDocumentRM,
  PreAccountingStatusRM,
  PreAccountingAnalyticsRM,
  PreAccountingExposureRM,
} from '../types';

export class PrecomptabiliteProjection {
  private documents = new Map<string, PreAccountingDocumentRM>();
  private statuses = new Map<string, PreAccountingStatusRM>();
  private analytics = new Map<string, PreAccountingAnalyticsRM>();

  apply(event: any): void {
    const { type, payload } = event;
    const key = `${payload.tenantId}:${payload.documentId}`;

    switch (type) {
      case 'DocumentCreated':
        this.documents.set(key, {
          tenantId: payload.tenantId,
          documentId: payload.documentId,
          documentType: payload.documentType,
          createdAt: payload.occurredAt,
        });
        this.statuses.set(key, {
          tenantId: payload.tenantId,
          documentId: payload.documentId,
          status: 'DRAFT',
          lastUpdatedAt: payload.occurredAt,
        });
        break;

      case 'DocumentMetadataUpdated':
        const doc = this.documents.get(key);
        if (doc) {
          this.documents.set(key, {
            ...doc,
            ...payload.metadata,
          });
        }
        if (payload.analytics) {
          this.analytics.set(key, {
            tenantId: payload.tenantId,
            documentId: payload.documentId,
            ...payload.analytics,
          });
        }
        break;

      case 'DocumentSubmitted':
        this.updateStatus(key, 'SUBMITTED', payload.occurredAt);
        break;

      case 'DocumentValidated':
        this.updateStatus(key, 'VALIDATED', payload.occurredAt);
        break;

      case 'DocumentRejected':
        this.updateStatus(key, 'REJECTED', payload.occurredAt);
        break;

      case 'DocumentSuspended':
        this.updateStatus(key, 'SUSPENDED', payload.occurredAt);
        break;
    }
  }

  private updateStatus(
    key: string,
    status: PreAccountingStatusRM['status'],
    at: string
  ) {
    const current = this.statuses.get(key);
    if (current) {
      this.statuses.set(key, {
        ...current,
        status,
        lastUpdatedAt: at,
      });
    }
  }

  // -------- snapshots --------

  snapshotDocuments(): PreAccountingDocumentRM[] {
    return Array.from(this.documents.values());
  }

  snapshotStatuses(): PreAccountingStatusRM[] {
    return Array.from(this.statuses.values());
  }

  snapshotAnalytics(): PreAccountingAnalyticsRM[] {
    return Array.from(this.analytics.values());
  }

  snapshotExposure(): PreAccountingExposureRM[] {
    const result: PreAccountingExposureRM[] = [];

    for (const [key, status] of this.statuses.entries()) {
      if (status.status === 'VALIDATED') {
        const doc = this.documents.get(key);
        const ana = this.analytics.get(key);

        if (doc) {
          result.push({
            tenantId: doc.tenantId,
            documentId: doc.documentId,
            status: 'VALIDATED',
            amount: doc.amount,
            currency: doc.currency,
            vatDeclared: doc.vatDeclared,
            projectId: ana?.projectId,
            costCenterId: ana?.costCenterId,
          });
        }
      }
    }

    return result;
  }
}
