/**
 * 📊 Read-Models - Types AccountingPeriodRM
 * 
 * Types pour les modèles de lecture des périodes comptables.
 */

import { AccountingEntryRM } from './AccountingEntryRM';

export interface AccountingPeriodRM {
  periodId: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  entries: AccountingEntryRM[];
}
