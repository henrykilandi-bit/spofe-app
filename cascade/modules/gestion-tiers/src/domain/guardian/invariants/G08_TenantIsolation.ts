import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G08_TenantIsolation {
  validate(ctx: GuardianContext): void {
    if (
      ctx.currentTier &&
      ctx.currentTier.tenantId !== ctx.tenantId
    ) {
      throw new GuardianError(
        'G08_CROSS_TENANT',
        'Cross-tenant access is forbidden'
      );
    }
  }
}