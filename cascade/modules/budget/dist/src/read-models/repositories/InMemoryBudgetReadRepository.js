"use strict";
// src/read-models/repositories/InMemoryBudgetReadRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryBudgetReadRepository = void 0;
class InMemoryBudgetReadRepository {
    constructor(objectives, cashflows, variances, timelines, alerts) {
        this.objectives = objectives;
        this.cashflows = cashflows;
        this.variances = variances;
        this.timelines = timelines;
        this.alerts = alerts;
    }
    async getObjectives(tenantId) {
        return this.objectives.filter(o => o.tenantId === tenantId);
    }
    async getCashflows(tenantId) {
        return this.cashflows.filter(c => c.tenantId === tenantId);
    }
    async getVariances(tenantId) {
        return this.variances.filter(v => v.tenantId === tenantId);
    }
    async getTimeline(tenantId) {
        return this.timelines.filter(t => t.tenantId === tenantId);
    }
    async getAlerts(tenantId) {
        return this.alerts.filter(a => a.tenantId === tenantId);
    }
}
exports.InMemoryBudgetReadRepository = InMemoryBudgetReadRepository;
//# sourceMappingURL=InMemoryBudgetReadRepository.js.map