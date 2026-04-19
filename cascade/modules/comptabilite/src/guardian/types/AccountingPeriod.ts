/**
 * 🧱 Types Guardian - AccountingPeriod
 * 
 * Types concrets pour les périodes comptables.
 */

import { AccountingEntry } from './AccountingEntry';

export type AccountingPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface AccountingPeriod {
  periodId: string;
  status: AccountingPeriodStatus;
  journals: Record<string, AccountingEntry[]>;
  auditTrail: {
    event: string;
    at: string;
    by: string;
  }[];
}
