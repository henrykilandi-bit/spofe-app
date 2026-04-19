import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

export class G07_AppendOnly {
  validate(ctx: GuardianContext): void {
    if (ctx.commandType === 'DELETE') {
      throw new GuardianError(
        'G07_DELETE_FORBIDDEN',
        'Delete operation is forbidden (append-only)'
      );
    }
  }
}