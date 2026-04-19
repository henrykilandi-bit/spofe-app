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
    initialPeriods.forEach(p => this.periods.set(p.periodId, p));
  }

  findPeriod(periodId: string): AccountingPeriodRM | null {
    return this.periods.get(periodId) ?? null;
  }

  findEntriesByPeriod(periodId: string): AccountingEntryRM[] {
    return this.periods.get(periodId)?.entries ?? [];
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
    this.periods.set(period.periodId, period);
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
}
