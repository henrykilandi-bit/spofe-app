import { TierEvent } from '../../domain/events/TierEvents';
import { TierContactView } from '../models/TierContactView';
export declare class TierContactProjection {
    private readonly store;
    apply(event: TierEvent): void;
    getByTier(tenantId: string, tierId: string): TierContactView | undefined;
}
//# sourceMappingURL=TierContactProjection.d.ts.map