"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecomptabiliteProjection = void 0;
class PrecomptabiliteProjection {
    constructor() {
        this.documents = new Map();
        this.statuses = new Map();
        this.analytics = new Map();
    }
    apply(event) {
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
    updateStatus(key, status, at) {
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
    snapshotDocuments() {
        return Array.from(this.documents.values());
    }
    snapshotStatuses() {
        return Array.from(this.statuses.values());
    }
    snapshotAnalytics() {
        return Array.from(this.analytics.values());
    }
    snapshotExposure() {
        const result = [];
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
exports.PrecomptabiliteProjection = PrecomptabiliteProjection;
//# sourceMappingURL=PrecomptabiliteProjection.js.map