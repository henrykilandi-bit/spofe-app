import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G04_DocumentDriven {
  validate(ctx: GuardianContext): void {
    if (!ctx.document) {
      throw new GuardianError(
        'G04_NO_DOCUMENT',
        'Mutation without document is forbidden'
      );
    }
  }
}