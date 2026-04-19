import type { StrategicEventRM } from '../types.js';

export interface IEventsReadRepository {
  getAll(tenantId: string): Promise<StrategicEventRM[]>;
  getByObjective(
    tenantId: string,
    objectiveId: string
  ): Promise<StrategicEventRM[]>;
  getByPeriod(
    tenantId: string,
    periodId: string
  ): Promise<StrategicEventRM[]>;
}
