import { TierEvent } from '../../domain/events/TierEvents';
import { TierByRoleView } from '../models/TierByRoleView';
export declare class TierByRoleProjection {
    private readonly store;
    apply(event: TierEvent): void;
    getAll(): TierByRoleView[];
}
//# sourceMappingURL=TierByRoleProjection.d.ts.map