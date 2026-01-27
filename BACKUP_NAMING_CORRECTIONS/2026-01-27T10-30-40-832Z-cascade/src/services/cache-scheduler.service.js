/**
 * 🕐 Cache Scheduler Service
 * Manages automated cache operations (purge, warm-up, cleanup)
 *
 * Features:
 * - Scheduled cache purge (remove expired entries)
 * - Cache warm-up (pre-load frequently used patterns)
 * - Memory cleanup (manage fallback cache RAM)
 * - Configurable schedules via cron expressions
 *
 * @module services/cache-scheduler
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const cache = require('./advanced-cache.service');

class CacheScheduler {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
    this.stats = {
      purgeTasks: 0,
      warmupTasks: 0,
      cleanupTasks: 0,
      purgedKeys: 0,
      warmedUpKeys: 0,
      memoryFreed: 0
    };
  }

  /**
   * Initialize all scheduled tasks
   */
  async initialize() {
    try {
      logger.logInfo('🕐 Cache Scheduler: Initializing...');

      // Schedule cache purge
      this.schedulePurge(
        process.env.CACHE_PURGE_SCHEDULE || '0 2 * * *' // 2 AM daily
      );

      // Schedule cache warm-up
      this.scheduleWarmup(
        process.env.CACHE_WARMUP_SCHEDULE || '0 0 * * *' // Midnight daily
      );

      // Schedule memory cleanup
      this.scheduleMemoryCleanup(
        process.env.CACHE_MEMORY_CLEANUP_SCHEDULE || '0 */6 * * *' // Every 6 hours
      );

      this.isRunning = true;
      logger.logInfo('✅ Cache Scheduler: Initialized successfully');
      logger.logInfo(`📊 Scheduled Tasks: ${this.tasks.size}`);

      return this;
    } catch (error) {
      logger.logError('❌ Cache Scheduler: Initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Schedule cache purge task
   * @param {string} schedule - Cron expression
   */
  schedulePurge(schedule) {
    try {
      const task = cron.schedule(schedule, async () => {
        await this.executePurge();
      });

      this.tasks.set('purge', task);
      logger.logInfo(`📅 Cache Purge scheduled: ${schedule}`);
    } catch (error) {
      logger.logError('❌ Failed to schedule cache purge', { error: error.message });
    }
  }

  /**
   * Schedule cache warm-up task
   * @param {string} schedule - Cron expression
   */
  scheduleWarmup(schedule) {
    try {
      const task = cron.schedule(schedule, async () => {
        await this.executeWarmup();
      });

      this.tasks.set('warmup', task);
      logger.logInfo(`📅 Cache Warm-up scheduled: ${schedule}`);
    } catch (error) {
      logger.logError('❌ Failed to schedule cache warm-up', { error: error.message });
    }
  }

  /**
   * Schedule memory cleanup task
   * @param {string} schedule - Cron expression
   */
  scheduleMemoryCleanup(schedule) {
    try {
      const task = cron.schedule(schedule, async () => {
        await this.executeMemoryCleanup();
      });

      this.tasks.set('cleanup', task);
      logger.logInfo(`📅 Memory Cleanup scheduled: ${schedule}`);
    } catch (error) {
      logger.logError('❌ Failed to schedule memory cleanup', { error: error.message });
    }
  }

  /**
   * Execute cache purge
   * Removes expired entries from Redis and fallback cache
   */
  async executePurge() {
    const startTime = Date.now();
    let purgedCount = 0;

    try {
      logger.logInfo('🧹 Cache Purge: Starting...');

      // Get Redis instance
      const redis = cache.getRedisClient();
      if (!redis) {
        logger.logWarn('⚠️  Cache Purge: Redis not available, skipping');
        return;
      }

      // Find keys expiring soon or already expired
      const cursor = await redis.scan(0, {
        MATCH: 'cache:*',
        COUNT: 100
      });

      const keys = cursor[1];

      // Check TTL and remove expired keys
      for (const key of keys) {
        try {
          const ttl = await redis.ttl(key);

          // Remove if already expired (TTL = -2) or expiring very soon (TTL < 60)
          if (ttl === -2 || (ttl > 0 && ttl < 60)) {
            await redis.del(key);
            purgedCount++;
            logger.logInfo(`🗑️  Purged key: ${key} (TTL: ${ttl}s)`);
          }
        } catch (error) {
          logger.logWarn(`⚠️  Failed to purge key ${key}: ${error.message}`);
        }
      }

      // Clean up in-memory fallback cache
      if (cache.fallbackCache) {
        const fallbackPurged = this.purgeFallbackCache();
        purgedCount += fallbackPurged;
      }

      const duration = Date.now() - startTime;
      this.stats.purgedKeys += purgedCount;
      this.stats.purgeTasks++;

      logger.logInfo(`✅ Cache Purge: Complete (${purgedCount} keys removed, ${duration}ms)`);
      logger.logSecurity('CACHE_PURGE_EXECUTED', {
        purgedKeys: purgedCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError('❌ Cache Purge: Failed', { error: error.message });
    }
  }

  /**
   * Execute cache warm-up
   * Pre-loads frequently used cache patterns
   */
  async executeWarmup() {
    const startTime = Date.now();
    let warmedCount = 0;

    try {
      logger.logInfo('🔥 Cache Warm-up: Starting...');

      // Define warm-up patterns (frequently used)
      const warmupPatterns = [
        {
          key: 'cache:chart-of-accounts',
          pattern: 'CHART_OF_ACCOUNTS',
          ttl: 7 * 24 * 3600, // 7 days
          description: 'Chart of accounts'
        },
        {
          key: 'cache:users',
          pattern: 'USERS_LIST',
          ttl: 24 * 3600, // 1 day
          description: 'Active users'
        },
        {
          key: 'cache:companies',
          pattern: 'COMPANIES_LIST',
          ttl: 24 * 3600, // 1 day
          description: 'Active companies'
        },
        {
          key: 'cache:accounting-rules',
          pattern: 'ACCOUNTING_RULES',
          ttl: 7 * 24 * 3600, // 7 days
          description: 'Accounting rules'
        }
      ];

      // Warm-up each pattern
      for (const pattern of warmupPatterns) {
        try {
          const value = {
            warmedAt: new Date().toISOString(),
            pattern: pattern.pattern,
            description: pattern.description
          };

          await cache.set(pattern.key, value, pattern.ttl);
          warmedCount++;
          logger.logInfo(`🔥 Warmed: ${pattern.description} (TTL: ${pattern.ttl}s)`);
        } catch (error) {
          logger.logWarn(`⚠️  Failed to warm ${pattern.description}: ${error.message}`);
        }
      }

      const duration = Date.now() - startTime;
      this.stats.warmedUpKeys += warmedCount;
      this.stats.warmupTasks++;

      logger.logInfo(`✅ Cache Warm-up: Complete (${warmedCount} patterns loaded, ${duration}ms)`);
      logger.logSecurity('CACHE_WARMUP_EXECUTED', {
        warmedPatterns: warmedCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError('❌ Cache Warm-up: Failed', { error: error.message });
    }
  }

  /**
   * Execute memory cleanup
   * Cleans up in-memory fallback cache
   */
  async executeMemoryCleanup() {
    const startTime = Date.now();
    let freedMemory = 0;

    try {
      logger.logInfo('💾 Memory Cleanup: Starting...');

      if (!cache.fallbackCache) {
        logger.logWarn('⚠️  Memory Cleanup: Fallback cache not available');
        return;
      }

      // Get current memory usage
      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Clear entries older than configured TTL
      const entries = Array.from(cache.fallbackCache.entries());
      let removedCount = 0;

      for (const [key, entry] of entries) {
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          cache.fallbackCache.delete(key);
          removedCount++;
        }
      }

      // Get memory after cleanup
      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      freedMemory = memBefore - memAfter;

      const duration = Date.now() - startTime;
      this.stats.memoryFreed += Math.max(0, freedMemory);
      this.stats.cleanupTasks++;

      logger.logInfo(
        `✅ Memory Cleanup: Complete (${removedCount} entries removed, ${freedMemory.toFixed(2)}MB freed, ${duration}ms)`
      );
      logger.logSecurity('MEMORY_CLEANUP_EXECUTED', {
        entriesRemoved: removedCount,
        memoryFreed: `${freedMemory.toFixed(2)}MB`,
        memoryBefore: `${memBefore.toFixed(2)}MB`,
        memoryAfter: `${memAfter.toFixed(2)}MB`,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError('❌ Memory Cleanup: Failed', { error: error.message });
    }
  }

  /**
   * Purge fallback in-memory cache
   * @returns {number} Number of entries removed
   */
  purgeFallbackCache() {
    let removedCount = 0;

    try {
      const entries = Array.from(cache.fallbackCache.entries());

      for (const [key, entry] of entries) {
        // Remove if expired or has been in cache > 24 hours
        const ageHours = (Date.now() - entry.createdAt) / (1000 * 60 * 60);

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          cache.fallbackCache.delete(key);
          removedCount++;
        } else if (ageHours > 24) {
          cache.fallbackCache.delete(key);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        logger.logInfo(`🗑️  Fallback cache purged: ${removedCount} entries removed`);
      }
    } catch (error) {
      logger.logWarn(`⚠️  Fallback cache purge failed: ${error.message}`);
    }

    return removedCount;
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    try {
      for (const [name, task] of this.tasks) {
        task.stop();
        logger.logInfo(`⏹️  Stopped task: ${name}`);
      }
      this.tasks.clear();
      this.isRunning = false;
      logger.logInfo('✅ Cache Scheduler: Stopped');
    } catch (error) {
      logger.logError('❌ Failed to stop scheduler', { error: error.message });
    }
  }

  /**
   * Get scheduler statistics
   * @returns {Object} Scheduler stats
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      tasksScheduled: this.tasks.size,
      ...this.stats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get health status
   * @returns {Object} Health status
   */
  getHealth() {
    return {
      status: this.isRunning ? 'healthy' : 'unhealthy',
      scheduler: {
        running: this.isRunning,
        tasks: this.tasks.size,
        lastPurge: this.stats.purgeTasks,
        lastWarmup: this.stats.warmupTasks,
        lastCleanup: this.stats.cleanupTasks
      },
      statistics: this.getStats()
    };
  }

  /**
   * Manually trigger a task
   * @param {string} taskName - Task to trigger (purge, warmup, cleanup)
   */
  async triggerTask(taskName) {
    try {
      logger.logInfo(`⚡ Manually triggering task: ${taskName}`);

      switch (taskName.toLowerCase()) {
        case 'purge':
          await this.executePurge();
          break;
        case 'warmup':
          await this.executeWarmup();
          break;
        case 'cleanup':
          await this.executeMemoryCleanup();
          break;
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }

      logger.logInfo(`✅ Task triggered: ${taskName}`);
      return { success: true, task: taskName };
    } catch (error) {
      logger.logError(`❌ Failed to trigger task ${taskName}`, { error: error.message });
      return { success: false, task: taskName, error: error.message };
    }
  }
}

// Create singleton instance
const scheduler = new CacheScheduler();

module.exports = scheduler;
