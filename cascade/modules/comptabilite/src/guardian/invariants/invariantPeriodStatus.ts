/**
 * 🔒 Invariants P0 - Statut de Période
 * 
 * G-COMPTA-01: Une écriture ne peut être ajoutée que si la période est OPEN
 * G-COMPTA-02: Aucune écriture ne peut être modifiée ou supprimée (append-only)
 * G-COMPTA-03: Une période CLOSED interdit toute nouvelle écriture
 * G-COMPTA-04: Une période LOCKED est juridiquement figée
 */

import { AccountingPeriod } from '../types/AccountingPeriod';
import { GuardianViolation } from '../../shared/errors';

export function invariantPeriodIsOpen(period: AccountingPeriod) {
  if (period.status !== 'OPEN') {
    throw new GuardianViolation(
      'G-COMPTA-01',
      'Accounting period is not OPEN'
    );
  }
}
