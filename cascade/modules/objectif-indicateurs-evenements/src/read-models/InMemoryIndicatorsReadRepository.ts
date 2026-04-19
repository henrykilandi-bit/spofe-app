import type { IIndicatorsReadRepository } from './ports/IndicatorsReadRepository.js';
import type { IndicatorRM } from './types.js';

export class InMemoryIndicatorsReadRepository
  implements IIndicatorsReadRepository
{
  constructor(private readonly data: IndicatorRM[]) {}

  async getAll(tenantId: string): Promise<IndicatorRM[]> {
    return this.data.filter((i) => i.tenantId === tenantId);
  }

  async getById(
    tenantId: string,
    indicatorId: string
  ): Promise<IndicatorRM | null> {
    return (
      this.data.find(
        (i) =>
          i.tenantId === tenantId &&
          i.indicatorId === indicatorId
      ) ?? null
    );
  }

  async getByObjective(
    tenantId: string,
    objectiveId: string
  ): Promise<IndicatorRM[]> {
    return this.data.filter(
      (i) =>
        i.tenantId === tenantId &&
        i.linkedObjectiveIds.includes(objectiveId)
    );
  }
}
