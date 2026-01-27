// cascade/src/middleware/logging.middleware.js
// ==============================================
// MIDDLEWARE LOGGING CENTRALISÉ v2.2
// ==============================================
// Enrichit chaque requête avec contexte + log timing/performance
// Pattern: Express middleware standard

import logger, { WinstonConfigService } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware d'initialisation contexte requête
 * - Génère Request ID unique
 * - Initialise contexte utilisateur
 * - Mesure durée requête
 * - Log automatique sur finish
 */
export const requestLoggingMiddleware = (req, res, next) => {
  // Générer Request ID unique
  req.id = req.headers['x-request-id'] || `req-${uuidv4().slice(0, 8)}`;
  req.startTime = Date.now();

  // Enrichir logger avec contexte
  res.locals.logger = {
    requestId: req.id,
    userId: req.user?.id,
    ip: req.ip,
    method: req.method,
    path: req.path,
  };

  // Attacher request ID aux réponses
  res.set('X-Request-ID', req.id);

  // Log entrée requête (debug level)
  if (process.env.LOG_REQUESTS === 'true') {
    logger.debug(`→ Incoming request`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip,
    });
  }

  // Intercepter fin réponse pour logging
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - req.startTime;

    // Déterminer niveau de log basé status
    const level =
      res.statusCode >= 500
        ? 'error'
        : res.statusCode >= 400
          ? 'warn'
          : res.statusCode >= 300
            ? 'info'
            : 'debug';

    const meta = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100),
    };

    // Log selon niveau
    if (level === 'error') {
      logger.error(`✗ Request failed`, meta);
    } else if (level === 'warn') {
      logger.warn(`⚠ Request warning`, meta);
    } else if (duration > 500) {
      logger.performance(`⚡ Slow request detected`, meta);
    } else {
      logger.info(`✓ Request completed`, meta);
    }

    // Appeler original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware logging erreurs
 * - Capture erreurs non-gérées
 * - Log stack trace + contexte
 * - Security logging pour erreurs sensibles
 */
export const errorLoggingMiddleware = (err, req, res, next) => {
  const duration = Date.now() - (req.startTime || Date.now());

  const errorMeta = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    status: err.statusCode || 500,
    duration,
    userId: req.user?.id,
    ip: req.ip,
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
  };

  // Log security si erreur d'auth
  if (err.statusCode === 401 || err.statusCode === 403) {
    logger.security(`🔒 Authentication/Authorization error`, errorMeta);
  }
  // Log erreur DB si applicable
  else if (err.name?.includes('SequelizeError')) {
    logger.error(`💥 Database error`, {
      ...errorMeta,
      dbError: err.original?.message,
    });
  }
  // Log error standard
  else {
    logger.error(`❌ Request error`, errorMeta);
  }

  next(err);
};

/**
 * Middleware logging performance
 * - Mesure temps chaque endpoint
 * - Log slowquery/API si dépassement seuil
 * - Collecter metrics pour monitoring
 */
export const performanceLoggingMiddleware = (req, res, next) => {
  // Wrapper la requête suivante pour mesurer performance
  const originalNext = next;
  next = function (...args) {
    const timeBeforeNext = Date.now();

    // Mesurer temps du controller
    const checkDuration = () => {
      const duration = Date.now() - timeBeforeNext;
      const configService = WinstonConfigService.getInstance();

      // Checker contre seuils
      if (duration > configService.performanceThresholds.slow_api) {
        logger.performance(`Slow endpoint execution`, {
          requestId: req.id,
          path: req.path,
          method: req.method,
          duration,
          threshold: configService.performanceThresholds.slow_api,
        });
      }
    };

    // Checker après réponse
    setTimeout(checkDuration, 0);

    return originalNext.apply(this, args);
  };

  next();
};

/**
 * Middleware security events logging
 * - Log tentatives non-autorisées
 * - Log suspicious patterns
 * - Rate limiting events
 */
export const securityLoggingMiddleware = (req, res, next) => {
  // Checker patterns suspects
  const suspiciousPatterns = [
    /(<|%3C).*?script.*?(>|%3E)/gi, // XSS attempts
    /union.*?select/gi, // SQL injection
    /\/admin\//gi, // Admin path probing
    /\.\.\/\.\.\/\.\.\/etc\/passwd/gi, // Path traversal
  ];

  const fullUrl = req.originalUrl;
  const body = JSON.stringify(req.body || {});

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl) || pattern.test(body)) {
      logger.security(`🚨 Suspicious request pattern detected`, {
        requestId: req.id,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        pattern: pattern.toString(),
      });
      break;
    }
  }

  next();
};

/**
 * Middleware audit trail
 * - Log actions critiques (create, update, delete)
 * - Capture old/new values
 * - Traçabilité utilisateur complète
 */
export const auditLoggingMiddleware = (req, res, next) => {
  // Capturer requête pour potentiel audit
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        // Audit seulement si succès
        logger.audit(`Data modification action`, {
          requestId: req.id,
          action: `${req.method} ${req.path}`,
          userId: req.user?.id,
          ip: req.ip,
          timestamp: new Date().toISOString(),
          // Capturer body si non-sensible
          bodyKeys: Object.keys(req.body || {}).filter(
            (k) => !['password', 'token', 'secret', 'authorization'].includes(k),
          ),
        });
      }
    });
  }

  next();
};

/**
 * Initialiser tous les middleware logging
 * Fonction helper pour app.js
 */
export function initializeLoggingMiddleware(app) {
  // Ordre d'exécution important!

  // 1. Security checks (detecter patterns malveillants)
  app.use(securityLoggingMiddleware);

  // 2. Request setup (contexte + timing)
  app.use(requestLoggingMiddleware);

  // 3. Performance monitoring
  app.use(performanceLoggingMiddleware);

  // 4. Audit trail (après request setup)
  app.use(auditLoggingMiddleware);

  // 5. Error logging (après tous les autres)
  app.use(errorLoggingMiddleware);

  logger.info('✅ Logging middleware initialized', {
    middleware: [
      'securityLogging',
      'requestLogging',
      'performanceLogging',
      'auditLogging',
      'errorLogging',
    ],
  });
}

export default {
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  performanceLoggingMiddleware,
  securityLoggingMiddleware,
  auditLoggingMiddleware,
  initializeLoggingMiddleware,
};
