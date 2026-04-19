/**
 * 🛡️ Guardian Types - Types spécifiques au Guardian Comptabilité
 */

import { AccountingEntry, AccountingPeriod } from '../../domain/AccountingPeriod.js';

/**
 * Contexte de validation pour une écriture
 */
export interface ContexteValidation {
  /** Période de validation */
  periodId: string;
  
  /** Acteur de la validation */
  validatedBy: string;
  
  /** Timestamp de la validation */
  validatedAt: Date;
  
  /** Références externes validées */
  referencesValidees: {
    /** Plan comptable actif */
    planComptaireActif: boolean;
    
    /** Tiers validés */
    tiersValides: boolean;
    
    /** Pièces justificatives présentes */
    piecesPresentes: boolean;
  };
}

/**
 * Résultat de validation d'une écriture
 */
export interface ResultatValidation {
  /** Statut de la validation */
  statut: 'VALIDÉ' | 'REFUSÉ' | 'ATTENTE';
  
  /** Référence de l'écriture si validée */
  referenceEcriture?: string;
  
  /** Motif de refus ou d'attente */
  motif?: string;
  
  /** Invariants violés */
  invariantsViolés?: string[];
  
  /** Timestamp de la validation */
  timestamp: Date;
}

/**
 * Résultat de validation d'un lot d'écritures
 */
export interface ResultatValidationLot {
  /** Statut global du lot */
  statutGlobal: 'VALIDÉ' | 'REFUSÉ_PARTIEL' | 'REFUSÉ_TOTAL';
  
  /** Résultats individuels */
  resultats: ResultatValidation[];
  
  /** Résumé des validations */
  resume: {
    total: number;
    valides: number;
    refusees: number;
    attente: number;
  };
  
  /** Timestamp de la validation */
  timestamp: Date;
}

/**
 * Résultat de vérification de période
 */
export interface ResultatPeriode {
  /** Statut de la période */
  statut: 'OUVERTE' | 'FERMABLE' | 'DÉJÀ_FERMÉE' | 'BLOQUÉE';
  
  /** Équilibre de la période */
  equilibre: {
    totalDebit: number;
    totalCredit: number;
    estEquilibré: boolean;
  };
  
  /** Nombre d'écritures */
  nombreEcritures: number;
  
  /** Actions possibles */
  actionsPossibles: ('VALIDER_ENTREE' | 'CLOTURER' | 'BLOQUER' | 'CONSULTER_SEULEMENT')[];
  
  /** Timestamp de la vérification */
  timestamp: Date;
}

/**
 * État de l'écriture avant validation
 */
export interface EtatEcriture {
  /** Écriture à valider */
  ecriture: AccountingEntry;
  
  /** Période cible */
  periodeCible: AccountingPeriod;
  
  /** Contexte de validation */
  contexte: ContexteValidation;
  
  /** Pré-validation des invariants */
  preValidation: {
    invariantsVerifies: string[];
    invariantsViolés: string[];
    estValide: boolean;
  };
}

/**
 * Commande de clôture de période
 */
export interface CommandeCloturePeriode {
  /** Identifiant de la période */
  periodId: string;
  
  /** Acteur de la clôture */
  cloturePar: string;
  
  /** Motif de la clôture */
  motifCloture: string;
  
  /** Timestamp de la clôture */
  clotureLe: Date;
  
  /** Vérification d'équilibre requise */
  verifierEquilibre: boolean;
}

/**
 * Résultat de clôture de période
 */
export interface ResultatCloturePeriode {
  /** Statut de la clôture */
  statut: 'CLOTURÉE' | 'ERREUR_ÉQUILIBRE' | 'DÉJÀ_CLOTURÉE' | 'NON_AUTORISÉE';
  
  /** Nouveau statut de la période */
  nouveauStatut?: 'CLOSED' | 'LOCKED';
  
  /** Référence de la clôture */
  referenceCloture?: string;
  
  /** Équilibre final */
  equilibreFinal?: {
    totalDebit: number;
    totalCredit: number;
    estEquilibré: boolean;
  };
  
  /** Erreurs éventuelles */
  erreurs?: string[];
  
  /** Timestamp de la clôture */
  timestamp: Date;
}
