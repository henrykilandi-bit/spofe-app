"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierController = void 0;
class TierController {
    constructor(summary, byStatus, byRole, contacts, audit) {
        this.summary = summary;
        this.byStatus = byStatus;
        this.byRole = byRole;
        this.contacts = contacts;
        this.audit = audit;
    }
    getTier(req) {
        const { tierId } = req.params;
        const tier = tierId
            ? this.summary.getById(req.tenantId, tierId)
            : undefined;
        if (!tier) {
            return { status: 404, body: { message: 'Tier not found' } };
        }
        return { status: 200, body: tier };
    }
    listTiers(req) {
        const { status } = req.query;
        const tiers = status
            ? this.byStatus.getAll().filter(t => t.tenantId === req.tenantId && t.status === status)
            : this.summary
                .getAll()
                .filter(t => t.tenantId === req.tenantId);
        return { status: 200, body: tiers };
    }
    getTierContacts(req) {
        const { tierId } = req.params;
        if (!tierId) {
            return { status: 400, body: { message: 'tierId required' } };
        }
        const view = this.contacts.getByTier(req.tenantId, tierId);
        return { status: 200, body: view ?? {} };
    }
    getTierAudit(req) {
        const { tierId } = req.params;
        if (!tierId) {
            return { status: 400, body: { message: 'tierId required' } };
        }
        const events = this.audit.getByTier(req.tenantId, tierId);
        return { status: 200, body: events };
    }
    getTierStatus(req) {
        const { tierId } = req.params;
        if (!tierId) {
            return { status: 400, body: { message: 'tierId required' } };
        }
        const tier = this.summary.getById(req.tenantId, tierId);
        if (!tier) {
            return { status: 404, body: { message: 'Tier not found' } };
        }
        return {
            status: 200,
            body: { tierId, status: tier.status }
        };
    }
    tierExists(req) {
        const { tierId } = req.params;
        if (!tierId) {
            return { status: 400, body: { exists: false } };
        }
        const exists = Boolean(this.summary.getById(req.tenantId, tierId));
        return { status: 200, body: { exists } };
    }
}
exports.TierController = TierController;
