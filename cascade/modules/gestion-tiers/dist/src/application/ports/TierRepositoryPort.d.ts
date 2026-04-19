import { TierAggregate } from '../../domain/guardian/GuardianContext';
export interface TierRepositoryPort {
    findById(tierId: string): Promise<TierAggregate | null>;
}
//# sourceMappingURL=TierRepositoryPort.d.ts.map