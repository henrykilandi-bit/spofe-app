// Enhanced Winston logger with secrets sanitization, daily rotation, and centralized config
// v2.2: Utilise WinstonConfigService pour gestion centralisée + metrics + contexte enrichi
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import WinstonConfigService, { getLogger } from '../services/winston-config-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sanitize function - Redact sensitive information from logs
 * @param {Object} info - Log info object
 * @returns {Object} Sanitized log info
 */
const sanitize = (info) => {
  const sensitive = ['password', 'token', 'secret', 'authorization', 'apikey', 'api_key', 'jwt', 'bearer'];
  let message = info.message;
  
  // Sanitize string messages
  if (typeof message === 'string') {
    sensitive.forEach(key => {
      const regex = new RegExp(`(${key}[=:\\s]+)([^\\s&,}]+)`, 'gi');
      message = message.replace(regex, '$1***REDACTED***');
    });
  }
  
  // Sanitize metadata objects
  if (info.metadata && typeof info.metadata === 'object') {
    const sanitizedMeta = { ...info.metadata };
    Object.keys(sanitizedMeta).forEach(key => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitizedMeta[key] = '***REDACTED***';
      }
    });
    return { ...info, message, metadata: sanitizedMeta };
  }
  
  return { ...info, message };
};

/**
 * Custom format for structured logging with sanitization
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}] ${stack || message} ${metaStr}`;
  })
);

/**
 * LOGGER PRINCIPAL - Utilise WinstonConfigService (v2.2)
 * 
 * Fonctionnalités:
 * ✅ Rotation quotidienne automatique
 * ✅ Compression logs >30j
 * ✅ Sanitization secrets
 * ✅ Contexte enrichi (requestId, userId, duration)
 * ✅ Nivea personnalisés (security, performance, audit)
 * ✅ Statistiques centralisées
 * ✅ Metrics hooks disponibles
 * 
 * Transports (v2.2):
 * - Console (dev)
 * - Combined logs (tous niveaux)
 * - Error logs (errors seulement)
 * - Security logs (security events)
 * - Performance logs (slow queries/APIs)
 * - Audit logs (immutable, 1 an rétention)
 */

// Obtenir logger configuré via service centralisé
const logger = getLogger();

// Ajouter les méthodes helpers pour backward compatibility
logger.logInfo = (msg, meta = {}) => logger.info(msg, meta);
logger.logError = (msg, meta = {}) => logger.error(msg, meta);
logger.logSecurity = (msg, meta = {}) => logger.security(msg, meta);
logger.logPerformance = (msg, meta = {}) => logger.performance(msg, meta);
logger.logAudit = (msg, meta = {}) => logger.audit(msg, meta);

/**
 * Helper pour logger requêtes HTTP avec sanitization
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {number} duration - Request duration in ms
 */
logger.logRequest = (req, res, duration) => {
  const configService = WinstonConfigService.getInstance();
  const sanitizedHeaders = { ...req.headers };
  if (sanitizedHeaders.authorization) {
    sanitizedHeaders.authorization = '***REDACTED***';
  }

  const meta = {
    method: req.method,
    path: req.path,
    status: res.statusCode,
    duration,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id
  };

  // Log performance si dépassement seuil
  if (duration > configService.performanceThresholds.slow_api) {
    logger.performance(`Slow HTTP request: ${req.method} ${req.path}`, meta);
  } else {
    logger.info(`HTTP Request: ${req.method} ${req.path}`, meta);
  }
};

/**
 * Middleware Express pour auto-logging + contexte
 */
logger.expressMiddleware = (req, res, next) => {
  const configService = WinstonConfigService.getInstance();
  return configService.expressMiddleware()(req, res, next);
};

/**
 * Obtenir statistiques logs actuelles
 */
logger.getStats = () => {
  const configService = WinstonConfigService.getInstance();
  return configService.generateStatsReport();
};

/**
 * Réinitialiser statistiques
 */
logger.resetStats = () => {
  const configService = WinstonConfigService.getInstance();
  configService.resetStats();
};

// Export du logger principal
export default logger;

// Fonctions utilitaires rapides (backward compatibility)
export const logInfo = (msg, meta = {}) => logger.info(msg, meta);
export const logError = (msg, meta = {}) => logger.error(msg, meta);
export const logSecurity = (msg, meta = {}) => logger.security(msg, meta);
export const logPerformance = (msg, meta = {}) => logger.performance(msg, meta);
export const logAudit = (msg, meta = {}) => logger.audit(msg, meta);

// Export service pour utilisation directe
export { WinstonConfigService, getLogger };
