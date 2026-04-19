import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G09_ActorRequired {
  validate(ctx: GuardianContext): void {
    if (!ctx.actorId) {
      throw new GuardianError(
        'G09_ACTOR_REQUIRED',
        'ActorId is required for any mutation'
      );
    }
  }
}