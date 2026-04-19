import { GuardianContext } from '../GuardianContext';
import { GuardianError } from '../GuardianError';

const FORBIDDEN_FIELDS = [
  'amount',
  'balance',
  'dueDate',
  'credit',
  'debit',
  'provision'
];

export class G10_NoFinancialLogic {
  validate(ctx: GuardianContext): void {
    for (const key of Object.keys(ctx.document.payload)) {
      if (FORBIDDEN_FIELDS.includes(key)) {
        throw new GuardianError(
          'G10_FINANCIAL_FIELD_DETECTED',
          `Financial field detected: ${key}`
        );
      }
    }
  }
}