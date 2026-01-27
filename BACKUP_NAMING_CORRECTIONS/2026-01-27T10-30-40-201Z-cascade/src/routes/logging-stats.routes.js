// cascade/src/routes/logging-stats.routes.js
// ============================================
// ROUTES: STATISTIQUES LOGGING v2.2
// ============================================
// Endpoints pour consulter stats logs centralisées
// Métriques: total logs, erreurs, performance, security events

import express from 'express';
import logger, { WinstonConfigService } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const configService = WinstonConfigService.getInstance();

/**
 * GET /api/logs/stats
 * Obtenir statistiques logs actuelles
 * Auth: Required (admin/viewer)
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = logger.getStats();

    res.json({
      success: true,
      data: {
        ...stats,
        thresholds: {
          slow_query_ms: configService.performanceThresholds.slow_query,
          slow_api_ms: configService.performanceThresholds.slow_api,
          high_memory_mb: configService.performanceThresholds.high_memory,
          high_cpu_percent: configService.performanceThresholds.high_cpu
        }
      },
      message: 'Logging statistics retrieved'
    });
  } catch (error) {
    logger.error('Error retrieving logging stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logging statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/logs/breakdown
 * Obtenir détail logs par niveau
 * Auth: Required (admin only)
 */
router.get('/breakdown', authenticateToken, (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin required'
      });
    }

    const stats = logger.getStats();
    const breakdown = {
      total: stats.totalLogs,
      byLevel: stats.breakdown,
      errorPercentage: stats.totalLogs > 0
        ? ((stats.breakdown.errors / stats.totalLogs) * 100).toFixed(2) + '%'
        : '0%',
      warningPercentage: stats.totalLogs > 0
        ? ((stats.breakdown.warnings / stats.totalLogs) * 100).toFixed(2) + '%'
        : '0%',
      security: stats.security
    };

    res.json({
      success: true,
      data: breakdown,
      message: 'Logging breakdown retrieved'
    });
  } catch (error) {
    logger.error('Error retrieving logging breakdown', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logging breakdown',
      error: error.message
    });
  }
});

/**
 * POST /api/logs/reset-stats
 * Réinitialiser statistiques
 * Auth: Required (admin only)
 */
router.post('/reset-stats', authenticateToken, (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin required'
      });
    }

    logger.resetStats();
    logger.audit(`📊 Logging statistics reset`, {
      userId: req.user?.id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Logging statistics reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting logging stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to reset logging statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/logs/health
 * Vérifier santé logging system
 * Auth: Public (health check)
 */
router.get('/health', (req, res) => {
  try {
    const stats = logger.getStats();
    const errorRate = stats.totalLogs > 0
      ? ((stats.breakdown.errors / stats.totalLogs) * 100)
      : 0;

    const health = {
      status: errorRate > 10 ? 'degraded' : 'healthy',
      errorRate: errorRate.toFixed(2) + '%',
      totalLogs: stats.totalLogs,
      logsPerHour: stats.logsPerHour,
      uptime: stats.uptime,
      timestamp: new Date().toISOString()
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health,
      message: 'Logging system health check'
    });
  } catch (error) {
    logger.error('Error checking logging health', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to check logging health',
      error: error.message
    });
  }
});

/**
 * POST /api/logs/test-all-levels
 * Tester tous les niveaux logging
 * Auth: Required (admin only)
 * Utile pour vérifier que logs fonctionnent correctement
 */
router.post('/test-all-levels', authenticateToken, (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin required'
      });
    }

    const requestId = req.id;

    // Test tous les niveaux
    logger.debug('📝 DEBUG level test', { requestId });
    logger.info('ℹ️ INFO level test', { requestId });
    logger.warn('⚠️ WARN level test', { requestId });
    logger.error('❌ ERROR level test', { requestId });
    logger.security('🔒 SECURITY level test', { requestId });
    logger.performance('⚡ PERFORMANCE level test', { requestId });
    logger.audit('📊 AUDIT level test', { requestId });

    logger.info('✅ All logging levels tested', {
      requestId,
      userId: req.user?.id
    });

    res.json({
      success: true,
      message: 'All logging levels tested successfully',
      details: {
        levelsTestedCount: 7,
        levels: ['debug', 'info', 'warn', 'error', 'security', 'performance', 'audit'],
        logsWrittenTo: [
          'logs/combined/combined-*.log',
          'logs/errors/error-*.log',
          'logs/security/security-*.log',
          'logs/performance/performance-*.log',
          'logs/audit/audit-*.log'
        ]
      }
    });
  } catch (error) {
    logger.error('Error testing logging levels', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to test logging levels',
      error: error.message
    });
  }
});

export default router;
