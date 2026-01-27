/**
 * 🕐 Cache Scheduler Controller
 * Handles all scheduler-related API requests
 *
 * @module controllers/scheduler.controller
 */

import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';
import cacheScheduler from '../services/cache-scheduler.service.js';

/**
 * Get scheduler health status
 * @route GET /api/scheduler/health
 * @returns {Object} Health status
 */
export async function getSchedulerHealth(req, res) {
  try {
    const health = cacheScheduler.getHealth();
    
    if (health.status === 'healthy') {
      return success(res, health, 200, '✅ Scheduler is healthy');
    } else {
      return error(res, '⚠️  Scheduler status degraded', 503, { health });
    }

  } catch (err) {
    logger.logError('❌ Failed to get scheduler health', { error: err.message });
    return error(res, 'Failed to get scheduler health', 500, { error: err.message });
  }
}

/**
 * Get scheduler statistics
 * @route GET /api/scheduler/stats
 * @returns {Object} Detailed statistics
 */
export async function getSchedulerStats(req, res) {
  try {
    const stats = cacheScheduler.getStats();
    
    return success(res, stats, 200, '✅ Scheduler statistics retrieved');

  } catch (err) {
    logger.logError('❌ Failed to get scheduler stats', { error: err.message });
    return error(res, 'Failed to get scheduler statistics', 500, { error: err.message });
  }
}

/**
 * Get list of scheduled tasks
 * @route GET /api/scheduler/tasks
 * @returns {Array} List of scheduled tasks
 */
export async function getScheduledTasks(req, res) {
  try {
    const tasks = cacheScheduler.getTasks();
    
    return success(res, tasks, 200, `✅ Retrieved ${tasks.length} scheduled tasks`);

  } catch (err) {
    logger.logError('❌ Failed to get scheduled tasks', { error: err.message });
    return error(res, 'Failed to get scheduled tasks', 500, { error: err.message });
  }
}

/**
 * Manually trigger a scheduled task
 * @route POST /api/scheduler/trigger/:taskName
 * @param {string} taskName - Task name (purge, warmup, cleanup)
 * @returns {Object} Result of task execution
 */
export async function triggerTask(req, res) {
  try {
    const { taskName } = req.params;
    const validTasks = ['purge', 'warmup', 'cleanup'];

    // Validate task name
    if (!taskName || !validTasks.includes(taskName.toLowerCase())) {
      return error(res, `Invalid task name. Valid tasks: ${validTasks.join(', ')}`, 400, { 
        taskName,
        validTasks 
      });
    }

    logger.logInfo(`⚡ Manually triggering cache task: ${taskName}`);

    // Trigger the task
    const result = await cacheScheduler.triggerTask(taskName.toLowerCase());

    if (result.success) {
      return success(res, result, 200, `✅ Task '${taskName}' executed successfully`);
    } else {
      return error(res, `Task '${taskName}' execution failed`, 500, result);
    }

  } catch (err) {
    logger.logError('❌ Failed to trigger scheduler task', { 
      error: err.message,
      taskName: req.params.taskName 
    });
    return error(res, 'Failed to trigger scheduler task', 500, { error: err.message });
  }
}
