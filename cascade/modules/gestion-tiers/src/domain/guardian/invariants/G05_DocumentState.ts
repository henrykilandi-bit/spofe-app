import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G05_DocumentState {
  validate(ctx: GuardianContext): void {
    if (ctx.document.state !== 'validated') {
      throw new GuardianError(
        'G05_DOCUMENT_NOT_VALIDATED',
        'Document must be validated'
      );
    }
  }
}