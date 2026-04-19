import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { ArchiveTier } from '../commands/ArchiveTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';
export declare class ArchiveTierHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: TierGuardian, repository: TierRepositoryPort, eventStore: TierEventStorePort);
    execute(command: ArchiveTier): Promise<void>;
}
//# sourceMappingURL=ArchiveTierHandler.d.ts.map