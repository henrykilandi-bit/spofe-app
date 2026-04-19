import type { IndicatorRM } from '../types.js';

export interface IIndicatorsReadRepository {
  getAll(tenantId: string): Promise<IndicatorRM[]>;
  getById(
    tenantId: string,
    indicatorId: string
  ): Promise<IndicatorRM | null>;
  getByObjective(
    tenantId: string,
    objectiveId: string
  ): Promise<IndicatorRM[]>;
}
