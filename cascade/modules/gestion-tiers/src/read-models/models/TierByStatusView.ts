import { TierStatus, TierRole } from '../../domain/guardian/GuardianContext';

export interface TierByStatusView {
  tenantId: string;
  status: TierStatus;
  tierId: string;
  roles: TierRole[];
  name?: string;
}