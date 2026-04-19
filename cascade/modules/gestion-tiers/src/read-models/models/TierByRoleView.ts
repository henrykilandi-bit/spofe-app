import { TierRole, TierStatus } from '../../domain/guardian/GuardianContext';

export interface TierByRoleView {
  tenantId: string;
  role: TierRole;
  tierId: string;
  status: TierStatus;
  name?: string;
}