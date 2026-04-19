/**
 * 📊 Read-Models - AccountingPeriodProjection
 * 
 * Projection en lecture seule des périodes comptables.
 * CQRS strict : aucune logique métier, uniquement des projections.
 */

import { AccountingPeriodRM } from '../types/AccountingPeriodRM';
import { AccountingEntryRM } from '../types/AccountingEntryRM';
import { AccountingEntry } from '../../guardian/types/AccountingEntry';

export class AccountingPeriodProjection {
  static applyEntry(
    period: AccountingPeriodRM,
    entry: AccountingEntry
  ): AccountingPeriodRM {
    const projectedLines: AccountingEntryRM[] = entry.lines.map(line => ({
      entryId: entry.entryId,
      periodId: entry.periodId,
      journalCode: entry.journalCode,
      entryDate: entry.entryDate,

      accountCode: line.accountCode,
      debit: line.debit,
      credit: line.credit,

      tierId: line.tierId,
      documentRef: entry.documentRef,

      sourceModule: entry.source.module,
      sourceId: entry.source.sourceId,

      createdAt: entry.createdAt
    }));

    return {
      ...period,
      entries: [...period.entries, ...projectedLines]
    };
  }

  static closePeriod(
    period: AccountingPeriodRM
  ): AccountingPeriodRM {
    return {
      ...period,
      status: 'CLOSED'
    };
  }
}
