import { TierRole, TierStatus } from '../../domain/guardian/GuardianContext';
export interface TierSummaryView {
    tenantId: string;
    tierId: string;
    status: TierStatus;
    roles: TierRole[];
    name?: string;
    legalIdentifiers?: string[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=TierSummaryView.d.ts.map