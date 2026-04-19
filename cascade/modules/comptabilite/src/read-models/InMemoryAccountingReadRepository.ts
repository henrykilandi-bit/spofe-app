/**
 * 📊 Read-Models - InMemoryAccountingReadRepository
 * 
 * Implémentation en mémoire du repository de lecture.
 * Utilisé pour les tests et le développement.
 */

import { AccountingReadRepository } from './ports/AccountingReadRepository';
import { AccountingPeriodRM } from './types/AccountingPeriodRM';
import { AccountingEntryRM } from './types/AccountingEntryRM';

export class InMemoryAccountingReadRepository
  implements AccountingReadRepository {

  private periods: Map<string, AccountingPeriodRM> = new Map();

  constructor(initialPeriods: AccountingPeriodRM[] = []) {
    initialPeriods.forEach(p =>
      this.periods.set(p.periodId, this.sanitizePeriod(p))
    );
  }

  findPeriod(periodId: string): AccountingPeriodRM | null {
    const period = this.periods.get(periodId);
    return period
      ? { ...period, entries: [...period.entries] }
      : null;
  }

  findEntriesByPeriod(periodId: string): AccountingEntryRM[] {
    return [...(this.periods.get(periodId)?.entries ?? [])];
  }

  findEntriesByAccount(
    periodId: string,
    accountCode: string
  ): AccountingEntryRM[] {
    return this.findEntriesByPeriod(periodId)
      .filter(e => e.accountCode === accountCode);
  }

  findEntriesByTier(
    periodId: string,
    tierId: string
  ): AccountingEntryRM[] {
    return this.findEntriesByPeriod(periodId)
      .filter(e => e.tierId === tierId);
  }
  
  // Méthodes pour les tests
  
  /**
   * Ajouter une période (pour les tests)
   */
  addPeriod(period: AccountingPeriodRM): void {
    this.periods.set(period.periodId, this.sanitizePeriod(period));
  }

  /**
   * Clore une période (pour les tests / use-cases de clôture)
   */
  closePeriod(periodId: string): void {
    const current = this.periods.get(periodId);
    if (!current) {
      return;
    }
    this.periods.set(periodId, {
      ...current,
      status: 'CLOSED'
    });
  }
  
  /**
   * Vider le repository (pour les tests)
   */
  clear(): void {
    this.periods.clear();
  }

  private sanitizePeriod(period: AccountingPeriodRM): AccountingPeriodRM {
    const entries = period.entries.filter(entry =>
      this.isValidEntryForPeriod(entry, period.periodId)
    );
    return {
      ...period,
      entries,
    };
  }

  private isValidEntryForPeriod(
    entry: AccountingEntryRM,
    periodId: string
  ): boolean {
    if (entry.periodId !== periodId) {
      return false;
    }

    const requiredStrings = [
      entry.entryId,
      entry.journalCode,
      entry.entryDate,
      entry.accountCode,
      entry.documentRef,
      entry.sourceModule,
      entry.sourceId,
      entry.createdAt,
    ];

    if (requiredStrings.some(value => !value || value.trim().length === 0)) {
      return false;
    }

    const debitIsValid = Number.isFinite(entry.debit) && entry.debit >= 0;
    const creditIsValid = Number.isFinite(entry.credit) && entry.credit >= 0;
    const hasMovement = entry.debit > 0 || entry.credit > 0;

    return debitIsValid && creditIsValid && hasMovement;
  }
}
