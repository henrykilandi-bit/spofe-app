/**
 * Domain Events — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * Events are append-only, immutable records of domain changes.
 * They are persisted in the event store and consumed by read-models.
 */

// ─────────────────────────────────────────────────────────────
// Base Event Interface
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Economic Project Events
// ─────────────────────────────────────────────────────────────

export interface EconomicProjectCreatedPayload {
  tenantId: string;
  projectId: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  createdBy: string;
  createdAt: Date;
}

export class EconomicProjectCreated implements DomainEvent<EconomicProjectCreatedPayload> {
  public readonly eventType = 'EconomicProjectCreated' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: EconomicProjectCreatedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = payload.projectId;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.createdAt;
    this.metadata = metadata;
  }
}

// ─────────────────────────────────────────────────────────────
// Cost Structure Events
// ─────────────────────────────────────────────────────────────

export interface CostStructureCreatedPayload {
  tenantId: string;
  projectId: string;
  version: number;
  createdBy: string;
  createdAt: Date;
}

export class CostStructureCreated implements DomainEvent<CostStructureCreatedPayload> {
  public readonly eventType = 'CostStructureCreated' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: CostStructureCreatedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = `${payload.projectId}:v${payload.version}`;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.createdAt;
    this.metadata = metadata;
  }
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

export class CostLineAdded implements DomainEvent<CostLineAddedPayload> {
  public readonly eventType = 'CostLineAdded' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: CostLineAddedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = `${payload.projectId}:v${payload.version}`;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.addedAt;
    this.metadata = metadata;
  }
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

export class AssumptionsUpdated implements DomainEvent<AssumptionsUpdatedPayload> {
  public readonly eventType = 'AssumptionsUpdated' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: AssumptionsUpdatedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = `${payload.projectId}:v${payload.version}`;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.updatedAt;
    this.metadata = metadata;
  }
}

// ─────────────────────────────────────────────────────────────
// Simulation Events
// ─────────────────────────────────────────────────────────────

export interface CostStructureSimulatedPayload {
  tenantId: string;
  projectId: string;
  version: number;
  totalCost: number;
  variableCostRatio: number;
  breakEvenPoint: number;
  marginAtTarget: number;
  scenarioResults: {
    pessimistic: { margin: number; roi: number };
    realistic: { margin: number; roi: number };
    optimistic: { margin: number; roi: number };
  };
  simulatedAt: Date;
}

export class CostStructureSimulated implements DomainEvent<CostStructureSimulatedPayload> {
  public readonly eventType = 'CostStructureSimulated' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: CostStructureSimulatedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = `${payload.projectId}:v${payload.version}`;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.simulatedAt;
    this.metadata = metadata;
  }
}

// ─────────────────────────────────────────────────────────────
// Freeze Events
// ─────────────────────────────────────────────────────────────

export interface CostStructureFrozenPayload {
  tenantId: string;
  projectId: string;
  version: number;
  frozenBy: string;
  frozenAt: Date;
  finalTotalCost: number;
  finalVariableCostRatio: number;
}

export class CostStructureFrozen implements DomainEvent<CostStructureFrozenPayload> {
  public readonly eventType = 'CostStructureFrozen' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: CostStructureFrozenPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = `${payload.projectId}:v${payload.version}`;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.frozenAt;
    this.metadata = metadata;
  }
}

// ─────────────────────────────────────────────────────────────
// Decision Events
// ─────────────────────────────────────────────────────────────

export interface ProjectValidatedPayload {
  tenantId: string;
  projectId: string;
  validatedBy: string;
  validatedAt: Date;
  justification: string;
}

export class ProjectValidated implements DomainEvent<ProjectValidatedPayload> {
  public readonly eventType = 'ProjectValidated' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: ProjectValidatedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = payload.projectId;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.validatedAt;
    this.metadata = metadata;
  }
}

export interface ProjectRejectedPayload {
  tenantId: string;
  projectId: string;
  rejectedBy: string;
  rejectedAt: Date;
  reason: string;
}

export class ProjectRejected implements DomainEvent<ProjectRejectedPayload> {
  public readonly eventType = 'ProjectRejected' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: ProjectRejectedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = payload.projectId;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.rejectedAt;
    this.metadata = metadata;
  }
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

export class DecisionRecorded implements DomainEvent<DecisionRecordedPayload> {
  public readonly eventType = 'DecisionRecorded' as const;
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly tenantId: string;
  public readonly occurredAt: Date;
  public readonly metadata: EventMetadata;

  constructor(public readonly payload: DecisionRecordedPayload, metadata: EventMetadata) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = payload.decisionId;
    this.tenantId = payload.tenantId;
    this.occurredAt = payload.decidedAt;
    this.metadata = metadata;
  }
}

// ─────────────────────────────────────────────────────────────
// Events Index
// ─────────────────────────────────────────────────────────────

export type CostStructureEvent =
  | EconomicProjectCreated
  | CostStructureCreated
  | CostLineAdded
  | AssumptionsUpdated
  | CostStructureSimulated
  | CostStructureFrozen
  | ProjectValidated
  | ProjectRejected
  | DecisionRecorded;
