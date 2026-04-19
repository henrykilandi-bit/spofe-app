import type { IEventsReadRepository } from './ports/EventsReadRepository.js';
import type { StrategicEventRM } from './types.js';

export class InMemoryEventsReadRepository
  implements IEventsReadRepository
{
  constructor(private readonly data: StrategicEventRM[]) {}

  async getAll(tenantId: string): Promise<StrategicEventRM[]> {
    return this.data.filter((e) => e.tenantId === tenantId);
  }

  async getByObjective(
    tenantId: string,
    objectiveId: string
  ): Promise<StrategicEventRM[]> {
    return this.data.filter(
      (e) =>
        e.tenantId === tenantId &&
        e.relatedObjectiveIds?.includes(objectiveId)
    );
  }

  async getByPeriod(
    tenantId: string,
    periodId: string
  ): Promise<StrategicEventRM[]> {
    return this.data.filter(
      (e) =>
        e.tenantId === tenantId &&
        e.relatedPeriodId === periodId
    );
  }
}
