/**
 * Domain Events — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * Events are append-only, immutable records of domain changes.
 * They are persisted in the event store and consumed by read-models.
 */
export interface DomainEvent<TPayload = unknown> {
    readonly eventId: string;
    readonly eventType: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly payload: TPayload;
    readonly metadata: EventMetadata;
}
export interface EventMetadata {
    readonly correlationId?: string;
    readonly causationId?: string;
    readonly actorId: string;
    readonly version: number;
}
export interface EconomicProjectCreatedPayload {
    tenantId: string;
    projectId: string;
    name: string;
    type: 'PRODUCT' | 'SERVICE';
    createdBy: string;
    createdAt: Date;
}
export declare class EconomicProjectCreated implements DomainEvent<EconomicProjectCreatedPayload> {
    readonly payload: EconomicProjectCreatedPayload;
    readonly eventType: "EconomicProjectCreated";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: EconomicProjectCreatedPayload, metadata: EventMetadata);
}
export interface CostStructureCreatedPayload {
    tenantId: string;
    projectId: string;
    version: number;
    createdBy: string;
    createdAt: Date;
}
export declare class CostStructureCreated implements DomainEvent<CostStructureCreatedPayload> {
    readonly payload: CostStructureCreatedPayload;
    readonly eventType: "CostStructureCreated";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: CostStructureCreatedPayload, metadata: EventMetadata);
}
export interface CostLineAddedPayload {
    tenantId: string;
    projectId: string;
    version: number;
    lineId: string;
    category: 'VARIABLE' | 'FIXED' | 'INDIRECT';
    label: string;
    amount: number;
    currency: string;
    allocationRule?: string;
    addedAt: Date;
}
export declare class CostLineAdded implements DomainEvent<CostLineAddedPayload> {
    readonly payload: CostLineAddedPayload;
    readonly eventType: "CostLineAdded";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: CostLineAddedPayload, metadata: EventMetadata);
}
export interface AssumptionsUpdatedPayload {
    tenantId: string;
    projectId: string;
    version: number;
    priceTarget: number;
    expectedVolume: number;
    capacityMax: number;
    scenarios: {
        pessimistic: number;
        realistic: number;
        optimistic: number;
    };
    updatedAt: Date;
}
export declare class AssumptionsUpdated implements DomainEvent<AssumptionsUpdatedPayload> {
    readonly payload: AssumptionsUpdatedPayload;
    readonly eventType: "AssumptionsUpdated";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: AssumptionsUpdatedPayload, metadata: EventMetadata);
}
export interface CostStructureSimulatedPayload {
    tenantId: string;
    projectId: string;
    version: number;
    totalCost: number;
    variableCostRatio: number;
    breakEvenPoint: number;
    marginAtTarget: number;
    scenarioResults: {
        pessimistic: {
            margin: number;
            roi: number;
        };
        realistic: {
            margin: number;
            roi: number;
        };
        optimistic: {
            margin: number;
            roi: number;
        };
    };
    simulatedAt: Date;
}
export declare class CostStructureSimulated implements DomainEvent<CostStructureSimulatedPayload> {
    readonly payload: CostStructureSimulatedPayload;
    readonly eventType: "CostStructureSimulated";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: CostStructureSimulatedPayload, metadata: EventMetadata);
}
export interface CostStructureFrozenPayload {
    tenantId: string;
    projectId: string;
    version: number;
    frozenBy: string;
    frozenAt: Date;
    finalTotalCost: number;
    finalVariableCostRatio: number;
}
export declare class CostStructureFrozen implements DomainEvent<CostStructureFrozenPayload> {
    readonly payload: CostStructureFrozenPayload;
    readonly eventType: "CostStructureFrozen";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: CostStructureFrozenPayload, metadata: EventMetadata);
}
export interface ProjectValidatedPayload {
    tenantId: string;
    projectId: string;
    validatedBy: string;
    validatedAt: Date;
    justification: string;
}
export declare class ProjectValidated implements DomainEvent<ProjectValidatedPayload> {
    readonly payload: ProjectValidatedPayload;
    readonly eventType: "ProjectValidated";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: ProjectValidatedPayload, metadata: EventMetadata);
}
export interface ProjectRejectedPayload {
    tenantId: string;
    projectId: string;
    rejectedBy: string;
    rejectedAt: Date;
    reason: string;
}
export declare class ProjectRejected implements DomainEvent<ProjectRejectedPayload> {
    readonly payload: ProjectRejectedPayload;
    readonly eventType: "ProjectRejected";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: ProjectRejectedPayload, metadata: EventMetadata);
}
export interface DecisionRecordedPayload {
    tenantId: string;
    projectId: string;
    decisionId: string;
    decision: 'VALIDATE' | 'REJECT' | 'REVISE';
    decidedBy: string;
    decidedAt: Date;
    comments?: string;
}
export declare class DecisionRecorded implements DomainEvent<DecisionRecordedPayload> {
    readonly payload: DecisionRecordedPayload;
    readonly eventType: "DecisionRecorded";
    readonly eventId: string;
    readonly aggregateId: string;
    readonly tenantId: string;
    readonly occurredAt: Date;
    readonly metadata: EventMetadata;
    constructor(payload: DecisionRecordedPayload, metadata: EventMetadata);
}
export type CostStructureEvent = EconomicProjectCreated | CostStructureCreated | CostLineAdded | AssumptionsUpdated | CostStructureSimulated | CostStructureFrozen | ProjectValidated | ProjectRejected | DecisionRecorded;
//# sourceMappingURL=index.d.ts.map