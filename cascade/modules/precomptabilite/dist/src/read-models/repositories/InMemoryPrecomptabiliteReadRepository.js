"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPrecomptabiliteReadRepository = void 0;
class InMemoryPrecomptabiliteReadRepository {
    constructor(documents, statuses, analytics, exposure) {
        this.documents = documents;
        this.statuses = statuses;
        this.analytics = analytics;
        this.exposure = exposure;
    }
    getDocuments(tenantId) {
        return this.documents.filter(d => d.tenantId === tenantId);
    }
    getStatuses(tenantId) {
        return this.statuses.filter(s => s.tenantId === tenantId);
    }
    getAnalytics(tenantId) {
        return this.analytics.filter(a => a.tenantId === tenantId);
    }
    getExposure(tenantId) {
        return this.exposure.filter(e => e.tenantId === tenantId);
    }
}
exports.InMemoryPrecomptabiliteReadRepository = InMemoryPrecomptabiliteReadRepository;
//# sourceMappingURL=InMemoryPrecomptabiliteReadRepository.js.map