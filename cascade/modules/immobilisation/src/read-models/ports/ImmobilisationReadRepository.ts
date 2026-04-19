import { ImmobilisationRM } from '../types';

export interface ImmobilisationReadRepository {
  getAll(tenantId: string): Promise<ImmobilisationRM[]>;
  getById(
    tenantId: string,
    immobilisationId: string
  ): Promise<ImmobilisationRM | null>;
  getInService(tenantId: string): Promise<ImmobilisationRM[]>;
  getDisposed(tenantId: string): Promise<ImmobilisationRM[]>;
  getByCategory(
    tenantId: string,
    category: ImmobilisationRM['category']
  ): Promise<ImmobilisationRM[]>;
}
