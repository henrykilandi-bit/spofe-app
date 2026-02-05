// Module OIE - Read Repository Ports
// Strict SPOFE conformance: READ-ONLY interfaces

export interface ObjectivesReadRepository {
  getAll(tenantId: string): Promise<unknown[]>;
  getById(tenantId: string, id: string): Promise<unknown | null>;
  getByPeriod(tenantId: string, periodId: string): Promise<unknown[]>;
}

export interface IndicatorsReadRepository {
  getAll(tenantId: string): Promise<unknown[]>;
  getById(tenantId: string, id: string): Promise<unknown | null>;
  getByObjective(tenantId: string, objectiveId: string): Promise<unknown[]>;
}

export interface EventsReadRepository {
  getAll(tenantId: string): Promise<unknown[]>;
  getByObjective(tenantId: string, objectiveId: string): Promise<unknown[]>;
  getByPeriod(tenantId: string, periodId: string): Promise<unknown[]>;
}