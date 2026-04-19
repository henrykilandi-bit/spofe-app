/**
 * 📊 Read-Models - Ports AccountingReadRepository
 * 
 * Interface du repository en lecture seule pour les données comptables.
 * CQRS strict : uniquement des opérations de lecture.
 */

import { AccountingEntryRM } from '../types/AccountingEntryRM';
import { AccountingPeriodRM } from '../types/AccountingPeriodRM';

export interface AccountingReadRepository {
  findPeriod(periodId: string): AccountingPeriodRM | null;

  findEntriesByPeriod(periodId: string): AccountingEntryRM[];

  findEntriesByAccount(
    periodId: string,
    accountCode: string
  ): AccountingEntryRM[];

  findEntriesByTier(
    periodId: string,
    tierId: string
  ): AccountingEntryRM[];
}
