/**
 * 🔒 Invariants P0 - Traçabilité
 * 
 * G-COMPTA-11: Toute écriture a une source identifiée (module + sourceId)
 * G-COMPTA-12: Toute écriture référence une pièce justificative
 * G-COMPTA-13: Toute écriture est horodatée et attribuée
 */

import { AccountingEntry } from '../types/AccountingEntry';
import { GuardianViolation } from '../../shared/errors';

export function invariantTraceability(entry: AccountingEntry) {
  if (!entry.source?.module || !entry.source?.sourceId) {
    throw new GuardianViolation(
      'G-COMPTA-11',
      'Entry source is mandatory'
    );
  }

  if (!entry.documentRef) {
    throw new GuardianViolation(
      'G-COMPTA-12',
      'Document reference is mandatory'
    );
  }

  if (!entry.createdAt || !entry.createdBy) {
    throw new GuardianViolation(
      'G-COMPTA-13',
      'Audit information is mandatory'
    );
  }
}
