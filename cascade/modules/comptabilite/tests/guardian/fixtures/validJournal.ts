/**
 * 🧰 ValidJournalFixture - Journaux Comptables Valides pour Tests
 */

import { Journal } from '../../../src/domain/AccountingPeriod.js';

export class ValidJournalFixture {
  
  /**
   * Crée un journal VENTE valide
   */
  static createSalesJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'VENTE',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée un journal ACHAT valide
   */
  static createPurchaseJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'ACHAT',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée un journal BANQUE valide
   */
  static createBankJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'BANQUE',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée un journal CAISSE valide
   */
  static createCashJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'CAISSE',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée un journal OD (Opérations Diverses) valide
   */
  static createODJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'OD',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée tous les journaux standards pour une période
   */
  static createAllJournals(periodId: string = 'PERIOD_2024_01'): Journal[] {
    return [
      this.createSalesJournal(periodId),
      this.createPurchaseJournal(periodId),
      this.createBankJournal(periodId),
      this.createCashJournal(periodId),
      this.createODJournal(periodId)
    ];
  }
  
  /**
   * Crée un journal non autorisé (pour tests négatifs)
   */
  static createUnauthorizedJournal(periodId: string = 'PERIOD_2024_01'): Journal {
    return {
      journalCode: 'INTERDIT',
      periodId,
      entries: []
    };
  }
  
  /**
   * Crée un journal d'une autre période (pour tests négatifs)
   */
  static createOtherPeriodJournal(): Journal {
    return {
      journalCode: 'VENTE',
      periodId: 'OTHER_PERIOD',
      entries: []
    };
  }
}
