import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { SuspendTier } from '../commands/SuspendTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';
export declare class SuspendTierHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: TierGuardian, repository: TierRepositoryPort, eventStore: TierEventStorePort);
    execute(command: SuspendTier): Promise<void>;
}
//# sourceMappingURL=SuspendTierHandler.d.ts.map