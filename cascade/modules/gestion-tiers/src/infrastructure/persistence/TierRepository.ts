import { Tier } from '../../domain/model/Tier';

export interface TierRepository {
  findById(tierId: string, tenantId: string): Promise<Tier | null>;
  findByTenantId(tenantId: string): Promise<Tier[]>;
  save(tier: Tier): Promise<void>;
  delete(tierId: string, tenantId: string): Promise<void>;
}

// TODO v1.1+: Implement concrete repository
// - PostgreSQL implementation
// - MongoDB implementation  
// - In-memory implementation (for testing)