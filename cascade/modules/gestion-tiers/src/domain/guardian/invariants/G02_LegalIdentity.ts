import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G02_LegalIdentity {
  validate(ctx: GuardianContext): void {
    const name = ctx.document.payload['name'];
    const legalIds = ctx.document.payload['legalIdentifiers'];

    if (!name && (!Array.isArray(legalIds) || legalIds.length === 0)) {
      throw new GuardianError(
        'G02_MISSING_LEGAL_IDENTITY',
        'Tier must have a name or at least one legal identifier'
      );
    }
  }
}