"use strict";
// src/api/BudgetReadController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetReadController = void 0;
class BudgetReadController {
    constructor(repo) {
        this.repo = repo;
    }
    async getObjectives(req) {
        const data = await this.repo.getObjectives(req.tenantId);
        return { status: 200, body: data };
    }
    async getCashflows(req) {
        const data = await this.repo.getCashflows(req.tenantId);
        return { status: 200, body: data };
    }
    async getVariances(req) {
        const data = await this.repo.getVariances(req.tenantId);
        return { status: 200, body: data };
    }
    async getTimeline(req) {
        const data = await this.repo.getTimeline(req.tenantId);
        return { status: 200, body: data };
    }
    async getAlerts(req) {
        const data = await this.repo.getAlerts(req.tenantId);
        return { status: 200, body: data };
    }
}
exports.BudgetReadController = BudgetReadController;
//# sourceMappingURL=BudgetReadController.js.map