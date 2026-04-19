import { AccountingGuardian } from '../guardian/AccountingGuardian';
import type { AccountingPeriod } from '../guardian/types/AccountingPeriod';

export interface CloseAccountingPeriodCommand {
  readonly period: AccountingPeriod;
  readonly closedBy: string;
  readonly closedAt: string;
}

export class CloseAccountingPeriod {
  execute(command: CloseAccountingPeriodCommand): AccountingPeriod {
    return AccountingGuardian.closePeriod(
      command.period,
      command.closedBy,
      command.closedAt
    );
  }
}
