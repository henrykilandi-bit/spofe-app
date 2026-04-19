import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G01_UniqueTier {
  validate(ctx: GuardianContext): void {
    if (!ctx.currentTier) return;

    const incomingIds = ctx.document.payload['legalIdentifiers'] as
      | string[]
      | undefined;

    if (!incomingIds || !ctx.currentTier.legalIdentifiers) return;

    const duplicate = incomingIds.some(id =>
      ctx.currentTier!.legalIdentifiers!.includes(id)
    );

    if (duplicate) {
      throw new GuardianError(
        'G01_DUPLICATE_LEGAL_ID',
        'Duplicate legal identifier detected for active tier'
      );
    }
  }
}