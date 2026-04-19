import type { ObjectiveRM } from '../types.js';

export interface IObjectivesReadRepository {
  getAll(tenantId: string): Promise<ObjectiveRM[]>;
  getById(
    tenantId: string,
    objectiveId: string
  ): Promise<ObjectiveRM | null>;
  getByPeriod(
    tenantId: string,
    periodId: string
  ): Promise<ObjectiveRM[]>;
}
