/**
 * 🔐 FOREIGN KEY SAFETY POLICY v2.1
 * ===================================
 * 
 * Classification de toutes les relations FK par risque
 * Stratégie de suppression par catégorie
 * 
 * CRITIQUE POUR PRODUCTION - Ne pas négliger!
 */

/**
 * CATÉGORIE A: DONNÉES MÉTIER CRITIQUES (RESTRICT)
 * ──────────────────────────────────────────────────
 * 
 * Raison: Suppression accidentelle = perte irrécupérable
 * Action: RESTRICT (empêche suppression du parent)
 * Cas d'usage: Groupes → Compagnies, Compagnies → Charts
 * 
 * Exemple de catastrophe:
 * DELETE FROM groupes_entreprises WHERE id = 1;
 * → Actuellement (CASCADE): Supprime 50 compagnies + 10,000 écritures
 * → Avec RESTRICT: Erreur "Cannot delete" → Protection!
 */
export const CRITICAL_BUSINESS_FK = [
  {
    name: 'compagnies.groupe_id',
    table: 'compagnies',
    column: 'groupe_id',
    references: {
      table: 'groupes_entreprises',
      field: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    reason: 'Une compagnie = années de données comptables',
    impact: 'CATASTROPHIQUE - Supprime toutes les compagnies du groupe',
    priorityFix: 1  // 🔴 URGENCE 1
  },
  {
    name: 'charts_of_accounts.compagnie_id',
    table: 'charts_of_accounts',
    column: 'compagnie_id',
    references: {
      table: 'compagnies',
      field: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    reason: 'Plan comptable = configuration métier OHADA critique',
    impact: 'GRAVE - Supprime tout le plan comptable',
    priorityFix: 1  // 🔴 URGENCE 1
  },
  {
    name: 'journal_entries.compagnie_id',
    table: 'journal_entries',
    column: 'compagnie_id',
    references: {
      table: 'compagnies',
      field: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    reason: 'Écritures comptables = historique financier immuable',
    impact: 'GRAVE - Supprime toutes les écritures de la compagnie',
    priorityFix: 1  // 🔴 URGENCE 1
  },
  {
    name: 'fiscal_years.compagnie_id',
    table: 'fiscal_years',
    column: 'compagnie_id',
    references: {
      table: 'compagnies',
      field: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    reason: 'Exercices fiscaux = configuration annuelle critique',
    impact: 'GRAVE - Détruit la configuration fiscale',
    priorityFix: 2  // 🟠 URGENCE 2
  }
];

/**
 * CATÉGORIE B: COMPOSITION LOGIQUE (CASCADE avec soft delete)
 * ──────────────────────────────────────────────────────────
 * 
 * Raison: Décomposition naturelle (enfants dépendent du parent)
 * Action: CASCADE (avec validation au niveau métier)
 * Garantie: Soft delete déjà actif → pas de suppression physique
 * Cas d'usage: Écritures → Lignes d'écritures
 * 
 * Sécurité:
 * - Trigger pour valider avant cascade
 * - Audit complète de l'action
 * - Vérification état logique avant suppression
 */
export const LOGICAL_COMPOSITION_FK = [
  {
    name: 'journal_entry_lines.journal_entry_id',
    table: 'journal_entry_lines',
    column: 'journal_entry_id',
    references: {
      table: 'journal_entries',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Lignes dépendent des écritures (composition)',
    impact: 'MODÉRÉ - OK avec soft delete actif',
    validation: 'Vérifier état "posted" avant cascade',
    priorityFix: 3
  },
  {
    name: 'account_balances.numero_compte_id',
    table: 'account_balances',
    column: 'numero_compte_id',
    references: {
      table: 'charts_of_accounts',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Soldes dépendent du compte comptable',
    impact: 'MODÉRÉ - Recalculable à partir des écritures',
    validation: 'Archive avant cascade',
    priorityFix: 3
  },
  {
    name: 'operation_templates_lines.template_id',
    table: 'operation_templates_lines',
    column: 'template_id',
    references: {
      table: 'operation_templates',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Lignes dépendent du template',
    impact: 'FAIBLE - Templates sont rarement supprimés',
    priorityFix: 4
  },
  {
    name: 'business_operation_audits.operation_id',
    table: 'business_operation_audits',
    column: 'operation_id',
    references: {
      table: 'business_operations',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Audit lines dépendent de l\'opération',
    impact: 'FAIBLE - Audit est soft deleted aussi',
    priorityFix: 4
  }
];

/**
 * CATÉGORIE C: DONNÉES DE SÉCURITÉ (CASCADE)
 * ──────────────────────────────────────────
 * 
 * Raison: Données liées à un utilisateur = suppression OK
 * Action: CASCADE (suppression de l'utilisateur = cleanup sécurité)
 * Cas d'usage: Users → 2FA, Tokens, Sessions
 * 
 * Sécurité: Attendu que ces données soient éphémères
 */
export const SECURITY_DATA_FK = [
  {
    name: 'two_factor_auths.user_id',
    table: 'two_factor_auths',
    column: 'user_id',
    references: {
      table: 'users',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: '2FA data est lié à l\'utilisateur',
    impact: 'ACCEPTABLE - Données éphémères',
    priorityFix: 5
  },
  {
    name: 'password_reset_tokens.user_id',
    table: 'password_reset_tokens',
    column: 'user_id',
    references: {
      table: 'users',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Tokens expirent et peuvent être purgés',
    impact: 'ACCEPTABLE - Données temporaires',
    priorityFix: 5
  },
  {
    name: 'token_blacklists.user_id',
    table: 'token_blacklists',
    column: 'user_id',
    references: {
      table: 'users',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    reason: 'Tokens blacklistés sont liés à l\'utilisateur',
    impact: 'ACCEPTABLE - Peut être nettoyé',
    priorityFix: 5
  }
];

/**
 * CATÉGORIE D: DONNÉES D'AUDIT (SET NULL)
 * ───────────────────────────────────────
 * 
 * Raison: Audit trails ne doivent pas être supprimées
 * Action: SET NULL (garde la trace, perd référence)
 * Cas d'usage: Audit trails → Utilisateurs
 * 
 * Conformité: OHADA, CNIL, SOX exigent conservation audit
 */
export const AUDIT_DATA_FK = [
  {
    name: 'audit_trails.user_id',
    table: 'audit_trails',
    column: 'user_id',
    references: {
      table: 'users',
      field: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    reason: 'Audit trails doivent être conservées',
    impact: 'COMPLIANT - Garde trace, perd userId',
    priorityFix: 2  // Important pour conformité
  },
  {
    name: 'security_events.user_id',
    table: 'security_events',
    column: 'user_id',
    references: {
      table: 'users',
      field: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    reason: 'Événements de sécurité doivent être conservés',
    impact: 'COMPLIANT - Traces même si utilisateur supprimé',
    priorityFix: 2
  }
];

/**
 * STRATÉGIE DE SUPPRESSION GLOBALE
 */
export const FK_STRATEGY = {
  // Données critiques = impossible à supprimer si enfants existent
  CRITICAL_BUSINESS: CRITICAL_BUSINESS_FK,
  
  // Composition = peut être cascade mais avec précautions
  LOGICAL_COMPOSITION: LOGICAL_COMPOSITION_FK,
  
  // Sécurité = cascade sans problème
  SECURITY_DATA: SECURITY_DATA_FK,
  
  // Audit = conservation absolue
  AUDIT_DATA: AUDIT_DATA_FK
};

/**
 * HELPER: Obtenir la stratégie FK pour une table
 */
export function getFKStrategy(tableName, columnName) {
  const fkName = `${tableName}.${columnName}`;
  
  for (const [category, constraints] of Object.entries(FK_STRATEGY)) {
    const found = constraints.find(c => c.name === fkName);
    if (found) {
      return {
        category,
        ...found
      };
    }
  }
  
  return null;
}

/**
 * HELPER: Obtenir toutes les FK critiques à corriger
 */
export function getCriticalFKsToFix() {
  return CRITICAL_BUSINESS_FK.sort((a, b) => a.priorityFix - b.priorityFix);
}

/**
 * HELPER: Vérifier si une FK est critique
 */
export function isCriticalFK(tableName, columnName) {
  const fkName = `${tableName}.${columnName}`;
  return CRITICAL_BUSINESS_FK.some(c => c.name === fkName);
}

/**
 * HELPER: Obtenir toutes les FK d'une table
 */
export function getTableForeignKeys(tableName) {
  const allFKs = [
    ...CRITICAL_BUSINESS_FK,
    ...LOGICAL_COMPOSITION_FK,
    ...SECURITY_DATA_FK,
    ...AUDIT_DATA_FK
  ];
  
  return allFKs.filter(fk => fk.table === tableName);
}

/**
 * DOCUMENTATION: Rapport d'audit FK
 * 
 * Pour générer un rapport:
 * ```javascript
 * import { getCriticalFKsToFix, getTableForeignKeys } from './foreign-key-policy.js';
 * 
 * const critical = getCriticalFKsToFix();
 * console.log('FK CRITIQUES À CORRIGER:', critical);
 * 
 * const userFKs = getTableForeignKeys('users');
 * console.log('FK DE LA TABLE users:', userFKs);
 * ```
 */

export default FK_STRATEGY;
