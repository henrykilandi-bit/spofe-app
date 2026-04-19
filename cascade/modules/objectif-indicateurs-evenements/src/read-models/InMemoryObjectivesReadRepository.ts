import type { IObjectivesReadRepository } from './ports/ObjectivesReadRepository.js';
import type { ObjectiveRM } from './types.js';

export class InMemoryObjectivesReadRepository
  implements IObjectivesReadRepository
{
  constructor(private readonly data: ObjectiveRM[]) {}

  async getAll(tenantId: string): Promise<ObjectiveRM[]> {
    return this.data.filter((o) => o.tenantId === tenantId);
  }

  async getById(
    tenantId: string,
    objectiveId: string
  ): Promise<ObjectiveRM | null> {
    return (
      this.data.find(
        (o) =>
          o.tenantId === tenantId &&
          o.objectiveId === objectiveId
      ) ?? null
    );
  }

  async getByPeriod(
    tenantId: string,
    periodId: string
  ): Promise<ObjectiveRM[]> {
    return this.data.filter(
      (o) =>
        o.tenantId === tenantId &&
        o.periodId === periodId
    );
  }
}
