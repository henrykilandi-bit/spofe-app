import { TierEvent } from '../../domain/events/TierEvents';
import { TierByStatusView } from '../models/TierByStatusView';
export declare class TierByStatusProjection {
    private readonly store;
    apply(event: TierEvent): void;
    getAll(): TierByStatusView[];
}
//# sourceMappingURL=TierByStatusProjection.d.ts.map