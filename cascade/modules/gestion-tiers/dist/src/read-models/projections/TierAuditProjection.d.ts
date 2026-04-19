import { TierEvent } from '../../domain/events/TierEvents';
import { TierAuditView } from '../models/TierAuditView';
export declare class TierAuditProjection {
    private readonly store;
    apply(event: TierEvent): void;
    getByTier(tenantId: string, tierId: string): TierAuditView[];
}
//# sourceMappingURL=TierAuditProjection.d.ts.map