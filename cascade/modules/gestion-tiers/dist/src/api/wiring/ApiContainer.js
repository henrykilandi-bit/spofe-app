"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiContainer = void 0;
const read_models_1 = require("../../read-models");
const TierController_1 = require("../http/TierController");
class ApiContainer {
    constructor() {
        // Projections (singletons in-memory)
        const summary = new read_models_1.TierSummaryProjection();
        const byStatus = new read_models_1.TierByStatusProjection();
        const byRole = new read_models_1.TierByRoleProjection();
        const contacts = new read_models_1.TierContactProjection();
        const audit = new read_models_1.TierAuditProjection();
        // Controller
        this.tierController = new TierController_1.TierController(summary, byStatus, byRole, contacts, audit);
    }
}
exports.ApiContainer = ApiContainer;
//# sourceMappingURL=ApiContainer.js.map