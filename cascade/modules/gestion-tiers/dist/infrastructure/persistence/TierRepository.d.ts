import { Tier } from '../../domain/model/Tier';
export interface TierRepository {
    findById(tierId: string, tenantId: string): Promise<Tier | null>;
    findByTenantId(tenantId: string): Promise<Tier[]>;
    save(tier: Tier): Promise<void>;
    delete(tierId: string, tenantId: string): Promise<void>;
}
//# sourceMappingURL=TierRepository.d.ts.map