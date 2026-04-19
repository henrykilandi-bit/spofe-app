"use strict";
// src/api/PrecomptabiliteReadController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecomptabiliteReadController = void 0;
class PrecomptabiliteReadController {
    constructor(repo) {
        this.repo = repo;
    }
    async getDocuments(req) {
        const data = await this.repo.getDocuments(req.tenantId);
        return { status: 200, body: data };
    }
    async getStatuses(req) {
        const data = await this.repo.getStatuses(req.tenantId);
        return { status: 200, body: data };
    }
    async getAnalytics(req) {
        const data = await this.repo.getAnalytics(req.tenantId);
        return { status: 200, body: data };
    }
    async getExposure(req) {
        const data = await this.repo.getExposure(req.tenantId);
        return { status: 200, body: data };
    }
}
exports.PrecomptabiliteReadController = PrecomptabiliteReadController;
//# sourceMappingURL=PrecomptabiliteReadController.js.map