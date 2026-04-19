import { GuardianContext, TierRole } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

const ALLOWED_ROLES: TierRole[] = [
  'CLIENT',
  'FOURNISSEUR',
  'SALARIE',
  'ORGANISME_SOCIAL',
  'AUTRE'
];

export class G03_ValidRoles {
  validate(ctx: GuardianContext): void {
    const roles = ctx.document.payload['roles'] as TierRole[] | undefined;

    if (!roles || roles.length === 0) {
      throw new GuardianError(
        'G03_NO_ROLE',
        'Tier must have at least one role'
      );
    }

    for (const role of roles) {
      if (!ALLOWED_ROLES.includes(role)) {
        throw new GuardianError(
          'G03_INVALID_ROLE',
          `Invalid tier role: ${role}`
        );
      }
    }
  }
}