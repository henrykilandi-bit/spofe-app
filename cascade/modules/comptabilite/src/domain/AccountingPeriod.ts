/**
 * 🧱 AccountingPeriod - Agrégat Racine du Module Comptabilité
 * 
 * La période comptable est l'unité de souveraineté du module.
 * Aucune écriture n'existe hors d'une période.
 * La période est la frontière de sécurité.
 */

export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

/**
 * Ligne d'écriture comptable
 */
export interface AccountingLine {
  /** Code du compte (ex: 101000, 401000) */
  accountCode: string;
  
  /** Montant au débit (>= 0) */
  debit: number;
  
  /** Montant au crédit (>= 0) */
  credit: number;
  
  /** Identifiant du tiers (obligatoire si classe 4) */
  tierId?: string;
  
  /** Référence documentaire */
  documentRef?: string;
}

/**
 * Source de l'écriture
 */
export interface EntrySource {
  /** Module d'origine */
  module: string;
  
  /** Identifiant dans le module source */
  sourceId: string;
}

/**
 * Écriture comptable
 */
export interface AccountingEntry {
  /** Identifiant unique de l'écriture */
  entryId: string;
  
  /** Code du journal */
  journalCode: string;
  
  /** Date de l'écriture */
  entryDate: Date;
  
  /** Lignes de l'écriture (minimum 2) */
  lines: AccountingLine[];
  
  /** Source de l'écriture */
  source: EntrySource;
  
  /** Référence à la pièce justificative */
  documentRef: string;
  
  /** Date de création */
  createdAt: Date;
  
  /** Créateur de l'écriture */
  createdBy: string;
}

/**
 * Journal comptable
 */
export interface Journal {
  /** Code du journal (ex: VENTE, ACHAT, BANQUE, CAISSE, OD) */
  journalCode: string;
  
  /** Identifiant de la période */
  periodId: string;
  
  /** Écritures du journal */
  entries: AccountingEntry[];
}

/**
 * Balance de la période (projection read-only)
 */
export interface PeriodBalance {
  /** Solde débit global */
  totalDebit: number;
  
  /** Solde crédit global */
  totalCredit: number;
  
  /** Équilibre (totalDebit === totalCredit) */
  isBalanced: boolean;
  
  /** Date du calcul */
  calculatedAt: Date;
}

/**
 * Trace d'audit
 */
export interface AuditTrail {
  /** Identifiant de l'événement */
  eventId: string;
  
  /** Type d'événement */
  eventType: 'ENTRY_CREATED' | 'PERIOD_CLOSED' | 'PERIOD_LOCKED';
  
  /** Date de l'événement */
  timestamp: Date;
  
  /** Acteur de l'événement */
  actor: string;
  
  /** Description de l'événement */
  description: string;
  
  /** Référence à l'objet concerné */
  targetId?: string;
}

/**
 * 🧱 AccountingPeriod - Agrégat Racine
 */
export interface AccountingPeriod {
  /** Identifiant unique de la période */
  periodId: string;
  
  /** Statut de la période */
  status: PeriodStatus;
  
  /** Date de début */
  startDate: Date;
  
  /** Date de fin */
  endDate: Date;
  
  /** Ensemble des journaux de la période */
  journalSet: Journal[];
  
  /** Balance (projection read-only) */
  balance: PeriodBalance;
  
  /** Trace d'audit complète */
  auditTrail: AuditTrail[];
}
