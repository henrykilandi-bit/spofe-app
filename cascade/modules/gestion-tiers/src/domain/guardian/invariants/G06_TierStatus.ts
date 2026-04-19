import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G06_TierStatus {
  validate(ctx: GuardianContext): void {
    if (ctx.currentTier?.status === 'ARCHIVED') {
      throw new GuardianError(
        'G06_TIER_ARCHIVED_IMMUTABLE',
        'Archived tier cannot be modified'
      );
    }
  }
}