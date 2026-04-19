import { ImmobilisationReadRepository } from './ports/ImmobilisationReadRepository';
import { ImmobilisationRM } from './types';

export class InMemoryImmobilisationReadRepository
  implements ImmobilisationReadRepository
{
  constructor(private readonly data: ImmobilisationRM[]) {}

  async getAll(tenantId: string): Promise<ImmobilisationRM[]> {
    return this.data.filter((i) => i.tenantId === tenantId);
  }

  async getById(
    tenantId: string,
    immobilisationId: string
  ): Promise<ImmobilisationRM | null> {
    return (
      this.data.find(
        (i) =>
          i.tenantId === tenantId &&
          i.immobilisationId === immobilisationId
      ) ?? null
    );
  }

  async getInService(tenantId: string): Promise<ImmobilisationRM[]> {
    return this.data.filter(
      (i) => i.tenantId === tenantId && i.status === 'IN_SERVICE'
    );
  }

  async getDisposed(tenantId: string): Promise<ImmobilisationRM[]> {
    return this.data.filter(
      (i) => i.tenantId === tenantId && i.status === 'DISPOSED'
    );
  }

  async getByCategory(
    tenantId: string,
    category: ImmobilisationRM['category']
  ): Promise<ImmobilisationRM[]> {
    return this.data.filter(
      (i) =>
        i.tenantId === tenantId && i.category === category
    );
  }
}
