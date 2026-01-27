/**
 * 🔥 Cache Warm-up Job
 * Pre-loads frequently used cache patterns
 *
 * Runs on schedule (typically at startup or daily) to:
 * - Pre-load chart of accounts
 * - Load user and company lists
 * - Load accounting rules
 * - Cache common queries
 * - Reduce latency for first requests
 *
 * @module jobs/cache-warmup
 */

const logger = require('../utils/logger');
const cache = require('../services/advanced-cache.service');

/**
 * Warm-up patterns to load
 */
const WARMUP_PATTERNS = [
  {
    key: 'cache:chart-of-accounts',
    pattern: 'CHART_OF_ACCOUNTS',
    ttl: 7 * 24 * 3600, // 7 days
    description: 'Chart of accounts (OHADA)',
    data: {
      accounts: ['1xxx', '2xxx', '3xxx', '4xxx', '5xxx', '6xxx', '7xxx', '8xxx', '9xxx'],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    key: 'cache:journal-types',
    pattern: 'JOURNAL_TYPES',
    ttl: 30 * 24 * 3600, // 30 days
    description: 'Journal types and configurations',
    data: {
      journals: ['Ventes', 'Achats', 'Banque', 'Caisse', 'OD'],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    key: 'cache:accounting-rules',
    pattern: 'ACCOUNTING_RULES',
    ttl: 7 * 24 * 3600, // 7 days
    description: 'Accounting validation rules',
    data: {
      rules: {
        debitCredit: 'balanced',
        decimals: 2,
        currencies: ['XOF', 'EUR', 'USD']
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    key: 'cache:fiscal-periods',
    pattern: 'FISCAL_PERIODS',
    ttl: 24 * 3600, // 1 day
    description: 'Fiscal periods and closing dates',
    data: {
      currentPeriod: new Date().toISOString().split('T')[0],
      closedPeriods: [],
      lastUpdated: new Date().toISOString()
    }
  },
  {
    key: 'cache:company-config',
    pattern: 'COMPANY_CONFIG',
    ttl: 24 * 3600, // 1 day
    description: 'Company configuration settings',
    data: {
      currency: 'XOF',
      fiscalYear: 'calendar',
      language: 'fr',
      lastUpdated: new Date().toISOString()
    }
  },
  {
    key: 'cache:ui-config',
    pattern: 'UI_CONFIG',
    ttl: 24 * 3600, // 1 day
    description: 'UI configuration and settings',
    data: {
      theme: 'light',
      locale: 'fr-FR',
      dateFormat: 'DD/MM/YYYY',
      lastUpdated: new Date().toISOString()
    }
  }
];

/**
 * Execute cache warm-up
 * @param {Object} options - Warm-up options
 * @returns {Promise<Object>} Warm-up result
 */
async function executeWarmup(options = {}) {
  const startTime = Date.now();
  const result = {
    success: false,
    warmedPatterns: 0,
    warmedKeys: [],
    duration: 0,
    timestamp: new Date().toISOString()
  };

  try {
    logger.logInfo('🔥 Cache Warm-up Job: Starting');

    const patterns = options.patterns || WARMUP_PATTERNS;
    const skipErrors = options.skipErrors !== false;

    for (const pattern of patterns) {
      try {
        // Set cache entry
        await cache.set(
          pattern.key,
          pattern.data,
          pattern.ttl
        );

        result.warmedKeys.push(pattern.key);
        result.warmedPatterns++;

        logger.logInfo(
          `🔥 Warmed: ${pattern.description} (TTL: ${pattern.ttl}s, key: ${pattern.key})`
        );

      } catch (error) {
        logger.logWarn(`⚠️  Failed to warm pattern "${pattern.description}": ${error.message}`);

        if (!skipErrors) {
          throw error;
        }
      }
    }

    const duration = Date.now() - startTime;

    result.success = true;
    result.duration = duration;

    logger.logInfo(
      `✅ Cache Warm-up Job: Complete (${result.warmedPatterns} patterns loaded, ${duration}ms)`
    );

    // Log for audit
    logger.logSecurity('CACHE_WARMUP_JOB', {
      warmedPatterns: result.warmedPatterns,
      warmedKeys: result.warmedKeys,
      duration: `${duration}ms`,
      timestamp: result.timestamp
    });

    return result;

  } catch (error) {
    logger.logError('❌ Cache Warm-up Job: Failed', { error: error.message });
    result.error = error.message;
    return result;
  }
}

/**
 * Schedule the warm-up job
 * @param {string} schedule - Cron expression
 * @returns {Object} Scheduled job info
 */
function scheduleJob(schedule = '0 0 * * *') {
  logger.logInfo(`📅 Cache Warm-up Job scheduled: ${schedule} (midnight daily)`);
  return {
    name: 'cache-warmup',
    schedule,
    description: 'Pre-load frequently used cache patterns',
    nextRun: 'scheduled'
  };
}

/**
 * Add custom warm-up pattern
 * @param {Object} pattern - Pattern to add
 */
function addPattern(pattern) {
  if (!pattern.key || !pattern.data) {
    throw new Error('Pattern must have key and data');
  }

  WARMUP_PATTERNS.push({
    key: pattern.key,
    pattern: pattern.pattern || pattern.key,
    ttl: pattern.ttl || 24 * 3600,
    description: pattern.description || pattern.key,
    data: pattern.data
  });

  logger.logInfo(`➕ Added warm-up pattern: ${pattern.description || pattern.key}`);
}

/**
 * Get current warm-up patterns
 * @returns {Array} List of patterns
 */
function getPatterns() {
  return WARMUP_PATTERNS.map(p => ({
    key: p.key,
    description: p.description,
    ttl: p.ttl,
    ttlHours: (p.ttl / 3600).toFixed(0)
  }));
}

/**
 * Clear a warm-up pattern
 * @param {string} patternKey - Pattern key to remove
 */
function removePattern(patternKey) {
  const index = WARMUP_PATTERNS.findIndex(p => p.key === patternKey);
  if (index >= 0) {
    const removed = WARMUP_PATTERNS.splice(index, 1)[0];
    logger.logInfo(`➖ Removed warm-up pattern: ${removed.description}`);
    return true;
  }
  return false;
}

module.exports = {
  execute: executeWarmup,
  schedule: scheduleJob,
  addPattern,
  removePattern,
  getPatterns,
  name: 'cache-warmup',
  description: 'Pre-load frequently used cache patterns for better performance',
  patterns: WARMUP_PATTERNS
};
