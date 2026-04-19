/**
 * 🛡️ AccountingGuardian - Autorité Unique de Validation Comptable
 * 
 * Implémentation finale du Guardian Comptabilité Générale.
 * Un seul point d'entrée, validation stricte, append-only.
 */

import { AccountingPeriod } from './types/AccountingPeriod';
import { AccountingEntry } from './types/AccountingEntry';

import { invariantPeriodIsOpen } from './invariants/invariantPeriodStatus';
import { invariantDoubleEntry } from './invariants/invariantDoubleEntry';
import { invariantTraceability } from './invariants/invariantTraceability';
import { InvariantClosure } from './invariants/invariantClosure';

export class AccountingGuardian {
  
  /**
   * Valider une nouvelle écriture comptable
   * 
   * @param period - Période comptable
   * @param entry - Écriture à valider
   * @throws GuardianViolation - Si un invariant P0 est violé
   */
  static validateNewEntry(
    period: AccountingPeriod,
    entry: AccountingEntry
  ): void {
    invariantPeriodIsOpen(period);
    invariantDoubleEntry(entry);
    invariantTraceability(entry);
  }

  /**
   * Clôturer une période comptable
   * 
   * @param period - Période à clôturer
   * @param by - Utilisateur qui clôture
   * @param at - Date/heure de clôture
   * @returns Nouvelle période clôturée
   * @throws Error - Si la période n'est pas OPEN
   */
  static closePeriod(
    period: AccountingPeriod,
    by: string,
    at: string
  ): AccountingPeriod {
    if (period.status !== 'OPEN') {
      throw new Error('Only OPEN periods can be closed');
    }

    const closedPeriod: AccountingPeriod = {
      ...period,
      status: 'CLOSED',
      auditTrail: [
        ...period.auditTrail,
        { event: 'PERIOD_CLOSED', by, at }
      ]
    };

    if (!InvariantClosure.validateAuditTrail(closedPeriod.auditTrail)) {
      throw new Error('Close period audit trail is invalid');
    }

    return closedPeriod;
  }
}
