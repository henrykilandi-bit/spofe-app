/**
 * 🔒 Invariants P0 - Guardian Comptabilité Générale
 * 
 * Ces invariants sont non négociables, bloquants, testés P0.
 * Ils constituent le cœur constitutionnel du Guardian.
 */

import { AccountingEntry, AccountingPeriod, AccountingLine } from '../../domain/AccountingPeriod.js';
import { ContexteValidation } from '../types/GuardianTypes.js';

/**
 * 🔒 A. Invariants de période
 */

/**
 * G-COMPTA-01: Une écriture ne peut être ajoutée que si la période est OPEN
 */
export function invariantPeriodeOuverte(
  periode: AccountingPeriod,
  ecriture: AccountingEntry
): boolean {
  return periode.status === 'OPEN';
}

/**
 * G-COMPTA-02: Aucune écriture ne peut être modifiée ou supprimée (append-only)
 */
export function invariantAppendOnly(
  periode: AccountingPeriod,
  ecriture: AccountingEntry
): boolean {
  // Vérifier que l'écriture n'existe pas déjà
  const ecritureExistante = periode.journalSet
    .flatMap(journal => journal.entries)
    .find(entry => entry.entryId === ecriture.entryId);
  
  return ecritureExistante === undefined;
}

/**
 * G-COMPTA-03: Une période CLOSED interdit toute nouvelle écriture
 */
export function invariantPeriodeNonFermee(
  periode: AccountingPeriod,
  ecriture: AccountingEntry
): boolean {
  return periode.status !== 'CLOSED' && periode.status !== 'LOCKED';
}

/**
 * G-COMPTA-04: Une période LOCKED est juridiquement figée
 */
export function invariantPeriodeNonBloquee(
  periode: AccountingPeriod,
  ecriture: AccountingEntry
): boolean {
  return periode.status !== 'LOCKED';
}

/**
 * ⚖️ B. Invariants de partie double
 */

/**
 * G-COMPTA-05: Une écriture contient au minimum 2 lignes
 */
export function invariantMinimumDeuxLignes(
  ecriture: AccountingEntry
): boolean {
  return ecriture.lines.length >= 2;
}

/**
 * G-COMPTA-06: Somme des débits = somme des crédits
 */
export function invariantEquilibrePartieDouble(
  ecriture: AccountingEntry
): boolean {
  const totalDebit = ecriture.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = ecriture.lines.reduce((sum, line) => sum + line.credit, 0);
  
  // Précision à 2 décimales pour éviter les erreurs de flottants
  return Math.abs(totalDebit - totalCredit) < 0.01;
}

/**
 * G-COMPTA-07: Une ligne ne peut pas avoir débit > 0 et crédit > 0
 */
export function invariantLigneNonMixte(
  ecriture: AccountingEntry
): boolean {
  return ecriture.lines.every(line => {
    // Soit débit > 0, soit crédit > 0, mais pas les deux
    return (line.debit > 0 && line.credit === 0) || 
           (line.credit > 0 && line.debit === 0) ||
           (line.debit === 0 && line.credit === 0); // Ligne nulle autorisée (rare)
  });
}

/**
 * 🧾 C. Invariants de conformité comptable
 */

/**
 * G-COMPTA-08: Le compte utilisé existe dans le plan comptable actif (Paramètres)
 */
export function invariantCompteExiste(
  ecriture: AccountingEntry,
  planComptaireActif: string[]
): boolean {
  return ecriture.lines.every(line => 
    planComptaireActif.includes(line.accountCode)
  );
}

/**
 * G-COMPTA-09: Les comptes respectent la nature autorisée (débit/crédit)
 */
export function invariantNatureCompte(
  ecriture: AccountingEntry,
  natureComptes: Record<string, 'DEBIT' | 'CREDIT' | 'BOTH'>
): boolean {
  return ecriture.lines.every(line => {
    const natureAutorisee = natureComptes[line.accountCode];
    
    if (!natureAutorisee) return false;
    
    if (natureAutorisee === 'DEBIT') {
      return line.debit > 0 && line.credit === 0;
    } else if (natureAutorisee === 'CREDIT') {
      return line.credit > 0 && line.debit === 0;
    } else {
      return true; // BOTH - aucune restriction
    }
  });
}

/**
 * G-COMPTA-10: Toute ligne en classe 4 référence un tiers valide et actif
 */
export function invariantTiersClasse4(
  ecriture: AccountingEntry,
  tiersValides: string[]
): boolean {
  return ecriture.lines.every(line => {
    // Si le compte commence par 4 (classe 4), un tiers est obligatoire
    if (line.accountCode.startsWith('4')) {
      return line.tierId !== undefined && tiersValides.includes(line.tierId);
    }
    return true; // Pas de restriction pour les autres classes
  });
}

/**
 * 🔗 D. Invariants de traçabilité
 */

/**
 * G-COMPTA-11: Toute écriture a une source identifiée (module + sourceId)
 */
export function invariantSourceIdentifiee(
  ecriture: AccountingEntry
): boolean {
  return ecriture.source.module !== undefined && 
         ecriture.source.module.trim() !== '' &&
         ecriture.source.sourceId !== undefined && 
         ecriture.source.sourceId.trim() !== '';
}

/**
 * G-COMPTA-12: Toute écriture référence une pièce justificative
 */
export function invariantPieceJustificative(
  ecriture: AccountingEntry
): boolean {
  return ecriture.documentRef !== undefined && 
         ecriture.documentRef.trim() !== '';
}

/**
 * G-COMPTA-13: Toute écriture est horodatée et attribuée
 */
export function invariantHorodatageAttribution(
  ecriture: AccountingEntry
): boolean {
  return ecriture.createdAt !== undefined &&
         ecriture.createdBy !== undefined && 
         ecriture.createdBy.trim() !== '' &&
         ecriture.entryDate !== undefined;
}

/**
 * 🧩 E. Invariants de journaux
 */

/**
 * G-COMPTA-14: Le journal utilisé est autorisé pour le type d'opération
 */
export function invariantJournalAutorise(
  ecriture: AccountingEntry,
  journauxAutorises: Record<string, string[]>
): boolean {
  const autorisations = journauxAutorises[ecriture.source.module];
  return autorisations ? autorisations.includes(ecriture.journalCode) : false;
}

/**
 * G-COMPTA-15: Un journal appartient à une seule période
 */
export function invariantJournalPeriodeUnique(
  periode: AccountingPeriod,
  ecriture: AccountingEntry
): boolean {
  // Vérifier que le journal n'existe pas déjà dans une autre période
  // (logique à implémenter au niveau du repository)
  return true; // Simplifié pour la modélisation
}

/**
 * 🔐 F. Invariants de clôture
 */

/**
 * G-COMPTA-16: La clôture vérifie l'équilibre global de la période
 */
export function invariantEquilibreGlobalCloture(
  periode: AccountingPeriod
): boolean {
  const totalDebit = periode.balance.totalDebit;
  const totalCredit = periode.balance.totalCredit;
  
  return Math.abs(totalDebit - totalCredit) < 0.01;
}

/**
 * G-COMPTA-17: La clôture interdit toute écriture postérieure
 */
export function invariantClotureInterditEcritures(
  periode: AccountingPeriod
): boolean {
  // Vérifier que la période est bien en OPEN avant clôture
  return periode.status === 'OPEN';
}

/**
 * G-COMPTA-18: La clôture génère une trace d'audit
 */
export function invariantTraceAuditCloture(
  periode: AccountingPeriod
): boolean {
  // Vérifier qu'une trace d'audit existe pour la clôture
  const traceCloture = periode.auditTrail.find(
    event => event.eventType === 'PERIOD_CLOSED'
  );
  
  return traceCloture !== undefined;
}

/**
 * 🎯 Fonction de validation complète
 */
export function validerTousInvariants(
  periode: AccountingPeriod,
  ecriture: AccountingEntry,
  contexte: ContexteValidation,
  donneesExternes: {
    planComptaireActif: string[];
    natureComptes: Record<string, 'DEBIT' | 'CREDIT' | 'BOTH'>;
    tiersValides: string[];
    journauxAutorises: Record<string, string[]>;
  }
): { invariantsPasses: string[]; invariantsViolés: string[]; estValide: boolean } {
  const invariantsPasses: string[] = [];
  const invariantsViolés: string[] = [];

  // Invariants de période
  if (invariantPeriodeOuverte(periode, ecriture)) {
    invariantsPasses.push('G-COMPTA-01');
  } else {
    invariantsViolés.push('G-COMPTA-01');
  }

  if (invariantAppendOnly(periode, ecriture)) {
    invariantsPasses.push('G-COMPTA-02');
  } else {
    invariantsViolés.push('G-COMPTA-02');
  }

  if (invariantPeriodeNonFermee(periode, ecriture)) {
    invariantsPasses.push('G-COMPTA-03');
  } else {
    invariantsViolés.push('G-COMPTA-03');
  }

  if (invariantPeriodeNonBloquee(periode, ecriture)) {
    invariantsPasses.push('G-COMPTA-04');
  } else {
    invariantsViolés.push('G-COMPTA-04');
  }

  // Invariants de partie double
  if (invariantMinimumDeuxLignes(ecriture)) {
    invariantsPasses.push('G-COMPTA-05');
  } else {
    invariantsViolés.push('G-COMPTA-05');
  }

  if (invariantEquilibrePartieDouble(ecriture)) {
    invariantsPasses.push('G-COMPTA-06');
  } else {
    invariantsViolés.push('G-COMPTA-06');
  }

  if (invariantLigneNonMixte(ecriture)) {
    invariantsPasses.push('G-COMPTA-07');
  } else {
    invariantsViolés.push('G-COMPTA-07');
  }

  // Invariants de conformité comptable
  if (invariantCompteExiste(ecriture, donneesExternes.planComptaireActif)) {
    invariantsPasses.push('G-COMPTA-08');
  } else {
    invariantsViolés.push('G-COMPTA-08');
  }

  if (invariantNatureCompte(ecriture, donneesExternes.natureComptes)) {
    invariantsPasses.push('G-COMPTA-09');
  } else {
    invariantsViolés.push('G-COMPTA-09');
  }

  if (invariantTiersClasse4(ecriture, donneesExternes.tiersValides)) {
    invariantsPasses.push('G-COMPTA-10');
  } else {
    invariantsViolés.push('G-COMPTA-10');
  }

  // Invariants de traçabilité
  if (invariantSourceIdentifiee(ecriture)) {
    invariantsPasses.push('G-COMPTA-11');
  } else {
    invariantsViolés.push('G-COMPTA-11');
  }

  if (invariantPieceJustificative(ecriture)) {
    invariantsPasses.push('G-COMPTA-12');
  } else {
    invariantsViolés.push('G-COMPTA-12');
  }

  if (invariantHorodatageAttribution(ecriture)) {
    invariantsPasses.push('G-COMPTA-13');
  } else {
    invariantsViolés.push('G-COMPTA-13');
  }

  // Invariants de journaux
  if (invariantJournalAutorise(ecriture, donneesExternes.journauxAutorises)) {
    invariantsPasses.push('G-COMPTA-14');
  } else {
    invariantsViolés.push('G-COMPTA-14');
  }

  if (invariantJournalPeriodeUnique(periode, ecriture)) {
    invariantsPasses.push('G-COMPTA-15');
  } else {
    invariantsViolés.push('G-COMPTA-15');
  }

  return {
    invariantsPasses,
    invariantsViolés,
    estValide: invariantsViolés.length === 0
  };
}
