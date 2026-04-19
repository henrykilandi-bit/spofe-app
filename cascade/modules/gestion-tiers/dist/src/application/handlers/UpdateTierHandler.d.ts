import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { UpdateTier } from '../commands/UpdateTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';
export declare class UpdateTierHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: TierGuardian, repository: TierRepositoryPort, eventStore: TierEventStorePort);
    execute(command: UpdateTier): Promise<void>;
}
//# sourceMappingURL=UpdateTierHandler.d.ts.map