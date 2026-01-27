/**
 * 🧹 Cache Purge Job
 * Removes expired and stale cache entries
 *
 * Runs on schedule to:
 * - Remove expired Redis keys
 * - Clear old fallback cache entries
 * - Log purge statistics
 * - Maintain cache efficiency
 *
 * @module jobs/cache-purge
 */

const logger = require('../utils/logger');
const cache = require('../services/advanced-cache.service');

/**
 * Execute cache purge
 * @returns {Promise<Object>} Purge result
 */
async function executePurge() {
  const startTime = Date.now();
  const result = {
    success: false,
    purgedKeys: 0,
    purgedSize: 0,
    duration: 0,
    timestamp: new Date().toISOString()
  };

  try {
    logger.logInfo('🧹 Cache Purge Job: Starting');

    // Get Redis instance
    const redis = cache.getRedisClient();
    if (!redis) {
      logger.logWarn('⚠️  Cache Purge Job: Redis not available, using fallback');
      return executeFallbackPurge();
    }

    // Scan and purge Redis cache
    let cursor = 0;
    let totalPurged = 0;
    let totalSize = 0;

    do {
      const reply = await redis.scan(cursor, {
        MATCH: 'cache:*',
        COUNT: 100
      });

      cursor = reply[0];
      const keys = reply[1];

      for (const key of keys) {
        try {
          const ttl = await redis.ttl(key);
          const size = await redis.strlen(key);

          // Purge conditions:
          // - Already expired (TTL = -2)
          // - Expiring very soon (TTL < 60 seconds)
          // - Large entries in cache (size > 1MB)
          const isExpired = ttl === -2;
          const isExpiringSoon = ttl > 0 && ttl < 60;
          const isLarge = size > 1024 * 1024;

          if (isExpired || isExpiringSoon || isLarge) {
            const deleted = await redis.del(key);
            if (deleted) {
              totalPurged++;
              totalSize += size;

              const reason = isExpired
                ? 'expired'
                : isExpiringSoon
                ? 'expiring-soon'
                : 'too-large';

              logger.logInfo(
                `🗑️  Purged key: ${key} (reason: ${reason}, size: ${(size / 1024).toFixed(2)}KB)`
              );
            }
          }
        } catch (error) {
          logger.logWarn(`⚠️  Failed to process key ${key}: ${error.message}`);
        }
      }
    } while (cursor !== 0);

    // Purge fallback cache
    const fallbackPurged = purgeFallbackCache();
    totalPurged += fallbackPurged.count;
    totalSize += fallbackPurged.size;

    const duration = Date.now() - startTime;

    result.success = true;
    result.purgedKeys = totalPurged;
    result.purgedSize = (totalSize / 1024 / 1024).toFixed(2); // MB
    result.duration = duration;

    logger.logInfo(
      `✅ Cache Purge Job: Complete (${totalPurged} keys, ${result.purgedSize}MB, ${duration}ms)`
    );

    // Log for audit
    logger.logSecurity('CACHE_PURGE_JOB', {
      purgedKeys: totalPurged,
      purgedSizeMB: result.purgedSize,
      duration: `${duration}ms`,
      timestamp: result.timestamp
    });

    return result;

  } catch (error) {
    logger.logError('❌ Cache Purge Job: Failed', { error: error.message });
    result.error = error.message;
    return result;
  }
}

/**
 * Fallback purge using local cache
 * @returns {Object} Purge result
 */
function purgeFallbackCache() {
  let purgedCount = 0;
  let purgedSize = 0;

  try {
    if (!cache.fallbackCache) {
      return { count: 0, size: 0 };
    }

    const entries = Array.from(cache.fallbackCache.entries());
    const now = Date.now();

    for (const [key, entry] of entries) {
      let shouldPurge = false;
      let reason = '';

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < now) {
        shouldPurge = true;
        reason = 'expired';
      }

      // Check if old (> 24 hours)
      else if (entry.createdAt && (now - entry.createdAt) > 24 * 60 * 60 * 1000) {
        shouldPurge = true;
        reason = 'too-old';
      }

      if (shouldPurge) {
        try {
          const size = JSON.stringify(entry.value).length;
          cache.fallbackCache.delete(key);
          purgedCount++;
          purgedSize += size;
          logger.logInfo(`🗑️  Purged fallback entry: ${key} (reason: ${reason})`);
        } catch (error) {
          logger.logWarn(`⚠️  Failed to purge fallback entry ${key}: ${error.message}`);
        }
      }
    }

    logger.logInfo(
      `✅ Fallback cache purged: ${purgedCount} entries, ${(purgedSize / 1024).toFixed(2)}KB`
    );

  } catch (error) {
    logger.logError('❌ Fallback cache purge failed', { error: error.message });
  }

  return { count: purgedCount, size: purgedSize };
}

/**
 * Schedule the purge job
 * @param {string} schedule - Cron expression
 * @returns {Object} Scheduled job info
 */
function scheduleJob(schedule = '0 2 * * *') {
  logger.logInfo(`📅 Cache Purge Job scheduled: ${schedule} (2 AM daily)`);
  return {
    name: 'cache-purge',
    schedule,
    description: 'Removes expired and stale cache entries',
    nextRun: 'scheduled'
  };
}

module.exports = {
  execute: executePurge,
  schedule: scheduleJob,
  name: 'cache-purge',
  description: 'Remove expired cache entries and optimize storage'
};
