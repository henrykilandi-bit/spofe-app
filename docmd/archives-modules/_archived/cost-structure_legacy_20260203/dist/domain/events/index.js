"use strict";
/**
 * Domain Events — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * Events are append-only, immutable records of domain changes.
 * They are persisted in the event store and consumed by read-models.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionRecorded = exports.ProjectRejected = exports.ProjectValidated = exports.CostStructureFrozen = exports.CostStructureSimulated = exports.AssumptionsUpdated = exports.CostLineAdded = exports.CostStructureCreated = exports.EconomicProjectCreated = void 0;
class EconomicProjectCreated {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'EconomicProjectCreated';
        this.eventId = crypto.randomUUID();
        this.aggregateId = payload.projectId;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.createdAt;
        this.metadata = metadata;
    }
}
exports.EconomicProjectCreated = EconomicProjectCreated;
class CostStructureCreated {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'CostStructureCreated';
        this.eventId = crypto.randomUUID();
        this.aggregateId = `${payload.projectId}:v${payload.version}`;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.createdAt;
        this.metadata = metadata;
    }
}
exports.CostStructureCreated = CostStructureCreated;
class CostLineAdded {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'CostLineAdded';
        this.eventId = crypto.randomUUID();
        this.aggregateId = `${payload.projectId}:v${payload.version}`;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.addedAt;
        this.metadata = metadata;
    }
}
exports.CostLineAdded = CostLineAdded;
class AssumptionsUpdated {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'AssumptionsUpdated';
        this.eventId = crypto.randomUUID();
        this.aggregateId = `${payload.projectId}:v${payload.version}`;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.updatedAt;
        this.metadata = metadata;
    }
}
exports.AssumptionsUpdated = AssumptionsUpdated;
class CostStructureSimulated {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'CostStructureSimulated';
        this.eventId = crypto.randomUUID();
        this.aggregateId = `${payload.projectId}:v${payload.version}`;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.simulatedAt;
        this.metadata = metadata;
    }
}
exports.CostStructureSimulated = CostStructureSimulated;
class CostStructureFrozen {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'CostStructureFrozen';
        this.eventId = crypto.randomUUID();
        this.aggregateId = `${payload.projectId}:v${payload.version}`;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.frozenAt;
        this.metadata = metadata;
    }
}
exports.CostStructureFrozen = CostStructureFrozen;
class ProjectValidated {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'ProjectValidated';
        this.eventId = crypto.randomUUID();
        this.aggregateId = payload.projectId;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.validatedAt;
        this.metadata = metadata;
    }
}
exports.ProjectValidated = ProjectValidated;
class ProjectRejected {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'ProjectRejected';
        this.eventId = crypto.randomUUID();
        this.aggregateId = payload.projectId;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.rejectedAt;
        this.metadata = metadata;
    }
}
exports.ProjectRejected = ProjectRejected;
class DecisionRecorded {
    constructor(payload, metadata) {
        this.payload = payload;
        this.eventType = 'DecisionRecorded';
        this.eventId = crypto.randomUUID();
        this.aggregateId = payload.decisionId;
        this.tenantId = payload.tenantId;
        this.occurredAt = payload.decidedAt;
        this.metadata = metadata;
    }
}
exports.DecisionRecorded = DecisionRecorded;
//# sourceMappingURL=index.js.map