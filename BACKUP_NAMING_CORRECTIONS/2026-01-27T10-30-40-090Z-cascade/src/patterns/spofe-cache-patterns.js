/**
 * Patterns de Cache Spécifiques à SPOFE
 * 
 * Patterns optimisés pour chaque entité SPOFE:
 * - Clés structurées hiérarchiquement
 * - Multi-tenant awareness
 * - TTL par type d'entité
 * - Invalidation cohérente
 * 
 * @author SPOFE Team
 * @version 2.1.0
 */

export const SPOFECachePatterns = {
  /**
   * 📊 Plan Comptable (Chart of Accounts)
   */
  CHART_OF_ACCOUNTS: {
    generateKey: (compagnieId) => `chart:${compagnieId}`,
    pattern: 'chart:*',
    ttl: 3600,
    invalidateOn: ['CHART_UPDATED', 'CHART_DELETED']
  },

  /**
   * 📝 Entrées de Journal (Journal Entries)
   */
  JOURNAL_ENTRIES: {
    generateKey: (compagnieId, pageHash, limit = 50) =>
      `journal:${compagnieId}:${pageHash}:${limit}`,
    
    generateSearchKey: (compagnieId, filterHash) =>
      `journal:search:${compagnieId}:${filterHash}`,
    
    pattern: 'journal:*',
    ttl: 300, // 5 minutes - données changeantes
    invalidateOn: ['ENTRY_CREATED', 'ENTRY_UPDATED', 'ENTRY_DELETED', 'ENTRY_VALIDATED']
  },

  /**
   * 💰 Balances de Comptes (Account Balances)
   */
  ACCOUNT_BALANCES: {
    generateKey: (compagnieId, periode) =>
      `balance:${compagnieId}:${periode}`,
    
    generateDetailKey: (compagnieId, accountId, periode) =>
      `balance:detail:${compagnieId}:${accountId}:${periode}`,
    
    pattern: 'balance:*',
    ttl: 1800, // 30 minutes
    invalidateOn: ['ENTRY_POSTED', 'BALANCE_RECALCULATED'],
    
    // Periods: YYYY-MM ou YYYY
    getPeriodeRange: (periode) => {
      const [year, month] = periode.split('-');
      return month ? `${year}-${month}` : year;
    }
  },

  /**
   * 📊 Balance de Vérification (Trial Balance)
   */
  TRIAL_BALANCE: {
    generateKey: (compagnieId, date) =>
      `balance:trial:${compagnieId}:${date}`,
    
    pattern: 'balance:trial:*',
    ttl: 3600,
    invalidateOn: ['ENTRY_POSTED', 'TRIAL_BALANCE_RECALCULATED']
  },

  /**
   * 📑 Rapports Financiers (Financial Reports)
   */
  FINANCIAL_REPORTS: {
    generateKey: (compagnieId, reportType, periode) =>
      `report:${compagnieId}:${reportType}:${periode}`,
    
    generateIncomeStatementKey: (compagnieId, periode) =>
      `report:${compagnieId}:income_statement:${periode}`,
    
    generateBalanceSheetKey: (compagnieId, periode) =>
      `report:${compagnieId}:balance_sheet:${periode}`,
    
    generateCashFlowKey: (compagnieId, periode) =>
      `report:${compagnieId}:cash_flow:${periode}`,
    
    pattern: 'report:*',
    ttl: 7200, // 2 heures
    invalidateOn: ['ENTRY_POSTED', 'REPORT_RECALCULATED', 'REPORT_CONFIGURATION_CHANGED'],
    
    reportTypes: [
      'income_statement',
      'balance_sheet',
      'cash_flow',
      'statement_of_changes',
      'notes_analysis'
    ]
  },

  /**
   * 👥 Sessions Utilisateur (User Sessions)
   */
  USER_SESSIONS: {
    generateKey: (userId) =>
      `session:user:${userId}`,
    
    generateCompagnieContextKey: (userId, compagnieId) =>
      `session:user:${userId}:compagnie:${compagnieId}`,
    
    pattern: 'session:user:*',
    ttl: 7200, // 2 heures
    invalidateOn: ['USER_LOGOUT', 'USER_PERMISSIONS_CHANGED', 'SESSION_EXPIRED']
  },

  /**
   * 🔐 JWT Blacklist (Security)
   */
  JWT_BLACKLIST: {
    generateKey: (tokenHash) =>
      `blacklist:jwt:${tokenHash}`,
    
    pattern: 'blacklist:jwt:*',
    ttl: 86400, // 24 heures
    invalidateOn: ['USER_LOGOUT', 'TOKEN_REVOKED']
  },

  /**
   * 🛡️ Événements de Sécurité (Security Events)
   */
  SECURITY_EVENTS: {
    generateKey: (compagnieId, eventType, date) =>
      `security:events:${compagnieId}:${eventType}:${date}`,
    
    generateFailedLoginKey: (compagnieId, date) =>
      `security:failed_login:${compagnieId}:${date}`,
    
    generateAuditKey: (compagnieId, entityType, entityId) =>
      `security:audit:${compagnieId}:${entityType}:${entityId}`,
    
    pattern: 'security:*',
    ttl: 86400, // 24 heures
    invalidateOn: ['SECURITY_AUDIT_CLEARED', 'SECURITY_LOG_ARCHIVED']
  },

  /**
   * 📈 Métriques et Performance (Metrics)
   */
  METRICS: {
    generateKey: (compagnieId, metric, timeframe = 'hour') =>
      `metrics:${compagnieId}:${metric}:${timeframe}`,
    
    generateCacheStatsKey: () =>
      'metrics:cache:stats',
    
    generateQueryStatsKey: (compagnieId) =>
      `metrics:query:${compagnieId}`,
    
    pattern: 'metrics:*',
    ttl: 300, // 5 minutes - souvent changées
    invalidateOn: ['METRICS_RESET', 'METRICS_ROTATION']
  },

  /**
   * ⚙️ Configuration Système (Configuration)
   */
  CONFIGURATION: {
    generateKey: (configKey) =>
      `config:system:${configKey}`,
    
    generateCompagnieConfigKey: (compagnieId, configKey) =>
      `config:${compagnieId}:${configKey}`,
    
    pattern: 'config:*',
    ttl: 604800, // 7 jours
    invalidateOn: ['CONFIG_UPDATED', 'CONFIG_RESET']
  },

  /**
   * 📋 Entités Tiers (Third-Party)
   */
  THIRD_PARTIES: {
    generateKey: (compagnieId) =>
      `third_party:${compagnieId}:list`,
    
    generateDetailKey: (compagnieId, thirdPartyId) =>
      `third_party:${compagnieId}:${thirdPartyId}`,
    
    generateBalanceKey: (compagnieId, thirdPartyId) =>
      `third_party:balance:${compagnieId}:${thirdPartyId}`,
    
    pattern: 'third_party:*',
    ttl: 1800, // 30 minutes
    invalidateOn: ['THIRD_PARTY_CREATED', 'THIRD_PARTY_UPDATED', 'THIRD_PARTY_DELETED']
  },

  /**
   * 📅 Budget (Budget Management)
   */
  BUDGET: {
    generateKey: (compagnieId, periode) =>
      `budget:${compagnieId}:${periode}`,
    
    generateDetailKey: (compagnieId, accountId, periode) =>
      `budget:detail:${compagnieId}:${accountId}:${periode}`,
    
    generateVsActualKey: (compagnieId, periode) =>
      `budget:vsactual:${compagnieId}:${periode}`,
    
    pattern: 'budget:*',
    ttl: 3600,
    invalidateOn: ['BUDGET_CREATED', 'BUDGET_UPDATED', 'BUDGET_PUBLISHED']
  },

  /**
   * 🔍 Recherche et Filtrage (Search Caching)
   */
  SEARCH: {
    generateKey: (entityType, compagnieId, filterHash) =>
      `search:${entityType}:${compagnieId}:${filterHash}`,
    
    pattern: 'search:*',
    ttl: 600,
    invalidateOn: ['ENTITY_CREATED', 'ENTITY_UPDATED', 'ENTITY_DELETED']
  },

  /**
   * Utilitaires de Patterns
   */

  generateCompagnieInvalidationKey: (compagnieId) => `compagnie:${compagnieId}:*`,

  /**
   * Hash un objet de filtres pour cache key
   */
  generateFilterHash: (filters) => {
    const sorted = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          result[key] = filters[key];
        }
        return result;
      }, {});

    return Buffer.from(JSON.stringify(sorted))
      .toString('base64')
      .slice(0, 12);
  },

  /**
   * Valide un pattern de cache
   */
  validatePattern: (pattern) => {
    const validPatterns = [
      'chart:*',
      'journal:*',
      'balance:*',
      'report:*',
      'session:*',
      'blacklist:*',
      'security:*',
      'metrics:*',
      'config:*',
      'third_party:*',
      'budget:*',
      'search:*'
    ];

    return validPatterns.includes(pattern);
  },

  /**
   * Obtient tous les patterns pour une compagnie
   */
  getCompagniePatterns: (compagnieId) => [
    `chart:${compagnieId}:*`,
    `journal:${compagnieId}:*`,
    `balance:${compagnieId}:*`,
    `report:${compagnieId}:*`,
    `balance:trial:${compagnieId}:*`,
    `third_party:${compagnieId}:*`,
    `budget:${compagnieId}:*`,
    `config:${compagnieId}:*`,
    `metrics:${compagnieId}:*`,
    `search:*:${compagnieId}:*`
  ]
};

export default SPOFECachePatterns;
