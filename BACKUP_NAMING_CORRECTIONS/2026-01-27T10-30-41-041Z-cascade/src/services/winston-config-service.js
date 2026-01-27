// cascade/src/services/winston-config-service.js
// ================================================
// SERVICE DE CONFIGURATION WINSTON CENTRALISÉE v2.2
// ================================================
// Gestion centralisée des logs avec metrics, stats, et contexte enrichi
// Pattern: Service Singleton pour configuration globale
// ================================================

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SERVICE SINGLETON: Winston Config Service
 * Gère logs centralisés avec metrics, stats, et contexte enrichi
 */
class WinstonConfigService {
  constructor() {
    this.instance = null;
    this.stats = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      securityEvents: 0,
      performanceIssues: 0,
      startTime: new Date()
    };
    this.requestContexts = new Map(); // Stocke contextes requête
    this.performanceThresholds = {
      slow_query: 1000,      // ms
      slow_api: 500,         // ms
      high_memory: 500,      // MB
      high_cpu: 80           // %
    };
  }

  /**
   * Obtenir instance Singleton
   */
  static getInstance() {
    if (!WinstonConfigService.instance) {
      WinstonConfigService.instance = new WinstonConfigService();
    }
    return WinstonConfigService.instance;
  }

  /**
   * Créer répertoires logs
   */
  ensureDirectories() {
    const logDir = 'logs';
    const directories = [
      logDir,
      path.join(logDir, 'combined'),
      path.join(logDir, 'errors'),
      path.join(logDir, 'security'),
      path.join(logDir, 'performance'),
      path.join(logDir, 'audit'),
      path.join(logDir, 'monitoring-reports')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    return logDir;
  }

  /**
   * Sanitization - Redacter informations sensibles
   */
  sanitizeData(info) {
    const sensitive = [
      'password', 'token', 'secret', 'authorization',
      'apikey', 'api_key', 'jwt', 'bearer', 'cookie',
      'sessionid', 'session_id', 'private_key', 'privateKey'
    ];

    let message = info.message;

    // Sanitize messages
    if (typeof message === 'string') {
      sensitive.forEach(key => {
        const regex = new RegExp(`(${key}[=:\\s]+)([^\\s&,}]+)`, 'gi');
        message = message.replace(regex, '$1***REDACTED***');
      });
    }

    // Sanitize metadata
    if (info.metadata && typeof info.metadata === 'object') {
      const sanitized = { ...info.metadata };
      Object.keys(sanitized).forEach(key => {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = '***REDACTED***';
        }
      });
      return { ...info, message, metadata: sanitized };
    }

    return { ...info, message };
  }

  /**
   * Enrichir contexte requête
   */
  enrichContext(info) {
    const context = {
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      pid: process.pid
    };

    // Ajouter contexte AsyncLocalStorage si disponible
    if (info.requestId) {
      context.requestId = info.requestId;
    }
    if (info.userId) {
      context.userId = info.userId;
    }
    if (info.duration) {
      context.duration = info.duration;
    }
    if (info.ip) {
      context.ip = info.ip;
    }
    if (info.method) {
      context.method = info.method;
    }
    if (info.path) {
      context.path = info.path;
    }

    return { ...info, context };
  }

  /**
   * Format personnalisé avec contexte enrichi
   */
  getCustomFormat() {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, stack, context, ...meta }) => {
        const contextStr = context
          ? ` [${context.requestId || 'no-req'}|${context.userId || 'no-user'}]`
          : '';

        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : '';

        return `${timestamp} [${level.toUpperCase()}]${contextStr}: ${message}${stack ? `\n${stack}` : ''}${metaStr}`;
      })
    );
  }

  /**
   * Créer logger avec tous les transports
   */
  createLogger() {
    this.ensureDirectories();

    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      format: this.getCustomFormat(),
      defaultMeta: { service: 'SPOFE-v2.1' }
    });

    // Transport: Console
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    }));

    // Transport: Combined logs (tous les niveaux)
    logger.add(new DailyRotateFile({
      filename: 'logs/combined/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxDays: '30d',
      zippedArchive: true,
      maxSize: '20m'
    }));

    // Transport: Error logs
    logger.add(new DailyRotateFile({
      level: 'error',
      filename: 'logs/errors/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxDays: '30d',
      zippedArchive: true,
      maxSize: '20m'
    }));

    // Transport: Security logs (security level)
    logger.add(new DailyRotateFile({
      level: 'security',
      filename: 'logs/security/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxDays: '60d',
      zippedArchive: true,
      maxSize: '20m'
    }));

    // Transport: Performance logs
    logger.add(new DailyRotateFile({
      level: 'performance',
      filename: 'logs/performance/performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxDays: '15d',
      zippedArchive: true,
      maxSize: '20m'
    }));

    // Transport: Audit logs (immutable, long retention)
    logger.add(new DailyRotateFile({
      level: 'audit',
      filename: 'logs/audit/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxDays: '365d',
      zippedArchive: true,
      maxSize: '50m'
    }));

    // Custom levels
    logger.levels = {
      ...winston.config.npm.levels,
      security: 3,
      performance: 4,
      audit: 5
    };

    return logger;
  }

  /**
   * Ajouter niveaux personnalisés
   */
  addCustomLevels(logger) {
    // Security level
    logger.security = (message, meta) => {
      this.stats.securityEvents++;
      return logger.log('security', message, meta);
    };

    // Performance level
    logger.performance = (message, meta) => {
      this.stats.performanceIssues++;
      return logger.log('performance', message, meta);
    };

    // Audit level
    logger.audit = (message, meta) => {
      return logger.log('audit', message, meta);
    };

    return logger;
  }

  /**
   * Middleware Express pour contexte requête
   */
  expressMiddleware(requestIdGenerator = null) {
    return (req, res, next) => {
      // Générer Request ID unique
      const requestId = requestIdGenerator
        ? requestIdGenerator()
        : `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      req.id = requestId;
      req.startTime = Date.now();

      // Stocker contexte
      this.requestContexts.set(requestId, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.id,
        startTime: req.startTime
      });

      // Nettoyer contexte après réponse
      res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        this.requestContexts.delete(requestId);

        // Log performance si lent
        if (duration > this.performanceThresholds.slow_api) {
          logger.performance(`Slow API request: ${req.method} ${req.path}`, {
            requestId,
            duration,
            status: res.statusCode
          });
        }
      });

      next();
    };
  }

  /**
   * Obtenir contexte requête courant
   */
  getRequestContext(requestId) {
    return this.requestContexts.get(requestId);
  }

  /**
   * Générer rapport statistiques logs
   */
  generateStatsReport() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    const logsPerHour = (this.stats.totalLogs / (uptime / (1000 * 3600))).toFixed(2);

    return {
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / (1000 * 3600))}h ${Math.floor((uptime / 60000) % 60)}m`,
      totalLogs: this.stats.totalLogs,
      logsPerHour,
      breakdown: {
        errors: this.stats.errorCount,
        warnings: this.stats.warningCount,
        info: this.stats.infoCount,
        debug: this.stats.debugCount
      },
      security: {
        events: this.stats.securityEvents,
        performanceIssues: this.stats.performanceIssues
      },
      performance: {
        slow_query_threshold_ms: this.performanceThresholds.slow_query,
        slow_api_threshold_ms: this.performanceThresholds.slow_api
      }
    };
  }

  /**
   * Helper: Log avec mise à jour stats
   */
  updateStats(level) {
    this.stats.totalLogs++;
    switch (level.toLowerCase()) {
      case 'error':
        this.stats.errorCount++;
        break;
      case 'warn':
        this.stats.warningCount++;
        break;
      case 'info':
        this.stats.infoCount++;
        break;
      case 'debug':
        this.stats.debugCount++;
        break;
    }
  }

  /**
   * Réinitialiser stats
   */
  resetStats() {
    this.stats = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      securityEvents: 0,
      performanceIssues: 0,
      startTime: new Date()
    };
  }
}

// Créer instance singleton
let loggerInstance = null;

/**
 * Fonction d'export: obtenir logger configuré
 */
export function getLogger() {
  if (!loggerInstance) {
    const configService = WinstonConfigService.getInstance();
    loggerInstance = configService.createLogger();
    configService.addCustomLevels(loggerInstance);

    // Wrapper pour mise à jour stats
    const originalLog = loggerInstance.log.bind(loggerInstance);
    loggerInstance.log = function(level, message, meta) {
      configService.updateStats(level);
      return originalLog(level, message, meta);
    };
  }

  return loggerInstance;
}

/**
 * Export service pour accès config
 */
export default WinstonConfigService;
