import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { CreateTier } from '../commands/CreateTier';
import { TierEventStorePort } from '../ports/TierEventStorePort';
export declare class CreateTierHandler {
    private readonly guardian;
    private readonly eventStore;
    constructor(guardian: TierGuardian, eventStore: TierEventStorePort);
    execute(command: CreateTier): Promise<void>;
}
//# sourceMappingURL=CreateTierHandler.d.ts.map