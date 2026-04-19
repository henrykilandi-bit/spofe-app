/**
 * 🔒 Invariants P0 - Partie Double
 * 
 * G-COMPTA-05: Une écriture contient au minimum 2 lignes
 * G-COMPTA-06: Somme des débits = somme des crédits
 * G-COMPTA-07: Une ligne ne peut pas avoir débit > 0 et crédit > 0
 */

import { AccountingEntry } from '../types/AccountingEntry';
import { GuardianViolation } from '../../shared/errors';

export function invariantDoubleEntry(entry: AccountingEntry) {
  if (entry.lines.length < 2) {
    throw new GuardianViolation(
      'G-COMPTA-05',
      'Accounting entry must have at least two lines'
    );
  }

  let debit = 0;
  let credit = 0;

  for (const line of entry.lines) {
    if (line.debit > 0 && line.credit > 0) {
      throw new GuardianViolation(
        'G-COMPTA-07',
        'Accounting line cannot have debit and credit'
      );
    }
    if (line.debit < 0 || line.credit < 0) {
      throw new GuardianViolation(
        'G-COMPTA-07',
        'Negative amounts are forbidden'
      );
    }

    debit += line.debit;
    credit += line.credit;
  }

  if (debit !== credit) {
    throw new GuardianViolation(
      'G-COMPTA-06',
      'Debit and credit are not balanced'
    );
  }
}
