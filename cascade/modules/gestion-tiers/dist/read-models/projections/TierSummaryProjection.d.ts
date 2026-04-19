import { TierEvent } from '../../domain/events/TierEvents';
import { TierSummaryView } from '../models/TierSummaryView';
export declare class TierSummaryProjection {
    private readonly store;
    apply(event: TierEvent): void;
    getAll(): TierSummaryView[];
    getById(tenantId: string, tierId: string): TierSummaryView | undefined;
}
//# sourceMappingURL=TierSummaryProjection.d.ts.map