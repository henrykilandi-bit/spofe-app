import { TierRole, TierStatus } from '../guardian/GuardianContext';
export interface Tier {
    tierId: string;
    tenantId: string;
    status: TierStatus;
    roles: TierRole[];
    legalIdentifiers?: string[];
    name?: string;
    createdAt: string;
    updatedAt: string;
}
export interface TierEntity extends Tier {
    version: number;
}
//# sourceMappingURL=Tier.d.ts.map