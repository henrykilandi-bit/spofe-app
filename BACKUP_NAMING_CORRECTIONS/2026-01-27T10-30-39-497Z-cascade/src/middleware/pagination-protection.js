/**
 * Middlewares de Protection de Pagination
 *
 * Fonctionnalités:
 * - Protection contre les requêtes sans pagination
 * - Rate limiting spécifique à la pagination
 * - Validation des paramètres
 * - Détection d'attaques DOS
 *
 * @author SPOFE Team
 * @version 2.1.0
 */

import AdvancedPaginationService from '../services/advanced-pagination.service.js';
import logger from '../utils/logger.js';
import { error as errorResponse } from '../utils/response.js';

/**
 * 🔐 Middleware de validation de pagination
 */
export const paginationProtection = AdvancedPaginationService.paginationMiddleware();

/**
 * 🚫 Middleware pour bloquer les requêtes sans pagination
 */
export const requirePagination = (req, res, next) => {
  // Ne s'applique qu'aux requêtes GET
  if (req.method !== 'GET') {
    return next();
  }

  const path = req.path;

  // Liste des endpoints nécessitant la pagination
  const paginationRequiredEndpoints = [
    '/api/secure-journal/entries',
    '/api/journal-entries',
    '/api/users',
    '/api/compagnies',
    '/api/audit-trails',
    '/api/security-events',
    '/api/secure-journal/search',
  ];

  // Vérifier si ce endpoint nécessite la pagination
  const requiresPagination = paginationRequiredEndpoints.some((endpoint) =>
    path.startsWith(endpoint),
  );

  if (requiresPagination) {
    // Vérifier si pagination fournie (page, limit ou cursor)
    const hasPagination = req.query.page || req.query.limit || req.query.cursor;

    if (!hasPagination && process.env.NODE_ENV === 'production') {
      logger.warn('Pagination required but not provided', {
        ip: req.ip,
        path: req.path,
        userId: req.user?.id,
        userAgent: req.get('User-Agent'),
      });

      return errorResponse(res, 'PAGINATION_REQUIRED', 400, {
        message: 'La pagination est obligatoire pour cet endpoint',
        documentation: '/api/docs#pagination',
        example: '?page=1&limit=50',
      });
    }

    // En développement, avertir mais continuer
    if (!hasPagination && process.env.NODE_ENV !== 'production') {
      logger.debug('Pagination recommended but not enforced in dev', {
        path: req.path,
      });
    }
  }

  next();
};

/**
 * ⏱️ Middleware de rate limiting pour la pagination
 */
const paginationRateLimitStore = new Map();

export const paginationRateLimit = (req, res, next) => {
  // Ne s'applique qu'aux requêtes GET avec pagination
  if (req.method !== 'GET') {
    return next();
  }

  const hasPagination = req.query.page || req.query.limit || req.query.cursor;
  if (!hasPagination) {
    return next();
  }

  // Identifier l'utilisateur/IP
  const userId = req.user?.id;
  const ip = req.ip;
  const key = userId ? `user:${userId}:pagination` : `ip:${ip}:pagination`;

  // Configuration de rate limit
  const WINDOW_SIZE = 60000; // 1 minute
  const MAX_REQUESTS = 100; // 100 requêtes par minute
  const COOLDOWN_PERIOD = 300000; // 5 minutes en cas de dépassement

  // Initialiser ou récupérer les stats
  let stats = paginationRateLimitStore.get(key) || {
    count: 0,
    firstRequestTime: Date.now(),
    blockedUntil: null,
  };

  // Vérifier si actuellement bloqué
  if (stats.blockedUntil && Date.now() < stats.blockedUntil) {
    const remainingTime = Math.ceil((stats.blockedUntil - Date.now()) / 1000);

    logger.warn('Pagination rate limit exceeded, user blocked', {
      key,
      remainingTime,
      ip,
      userId,
    });

    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Trop de requêtes de pagination. Attendez ${remainingTime} secondes`,
      retryAfter: remainingTime,
    });
  }

  // Réinitialiser le compteur si la fenêtre est expirée
  if (Date.now() - stats.firstRequestTime > WINDOW_SIZE) {
    stats = {
      count: 0,
      firstRequestTime: Date.now(),
      blockedUntil: null,
    };
  }

  // Incrémenter le compteur
  stats.count++;

  // Vérifier si limite dépassée
  if (stats.count > MAX_REQUESTS) {
    stats.blockedUntil = Date.now() + COOLDOWN_PERIOD;

    logger.error('Pagination rate limit exceeded, user blocked', {
      key,
      requestCount: stats.count,
      maxRequests: MAX_REQUESTS,
      blockDuration: COOLDOWN_PERIOD,
      ip,
      userId,
      suspicious: true,
    });

    // Stocker les stats
    paginationRateLimitStore.set(key, stats);

    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de requêtes dépassée. Service temporairement indisponible',
      retryAfter: Math.ceil(COOLDOWN_PERIOD / 1000),
    });
  }

  // Stocker les stats
  paginationRateLimitStore.set(key, stats);

  // Ajouter info au headers de réponse
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - stats.count);
  res.setHeader('X-RateLimit-Reset', new Date(stats.firstRequestTime + WINDOW_SIZE).toISOString());

  next();
};

/**
 * 🔍 Middleware pour détecter les patterns suspects
 */
export const detectSuspiciousPatterns = (req, res, next) => {
  // Ne s'applique qu'aux requêtes GET avec pagination
  if (req.method !== 'GET') {
    return next();
  }

  const hasPagination = req.query.page || req.query.limit || req.query.cursor;
  if (!hasPagination) {
    return next();
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  // Déterminer les patterns suspects
  const suspiciousIndicators = [];

  // Pattern 1: Très grand offset (potential scan complet)
  const offset = (page - 1) * limit;
  if (offset > 1000000) {
    suspiciousIndicators.push({
      type: 'LARGE_OFFSET',
      severity: 'HIGH',
      value: offset,
    });
  }

  // Pattern 2: Limite très élevée malgré capping
  if (limit === 100 && req.query.limit && parseInt(req.query.limit) > 500) {
    suspiciousIndicators.push({
      type: 'LIMIT_MANIPULATION',
      severity: 'MEDIUM',
      value: parseInt(req.query.limit),
    });
  }

  // Pattern 3: Accès rapide à beaucoup de pages différentes
  const userId = req.user?.id;
  const key = `page_access:${userId}`;
  const userPageAccess = (req.app.locals.pageAccessStats = req.app.locals.pageAccessStats || {});

  if (!userPageAccess[key]) {
    userPageAccess[key] = {
      pages: new Set(),
      firstAccess: Date.now(),
    };
  }

  const stats = userPageAccess[key];
  stats.pages.add(page);

  // Réinitialiser après 5 minutes
  if (Date.now() - stats.firstAccess > 300000) {
    stats.pages.clear();
    stats.firstAccess = Date.now();
  }

  // Si plus de 50 pages différentes en 5 minutes
  if (stats.pages.size > 50) {
    suspiciousIndicators.push({
      type: 'RAPID_PAGE_SCANNING',
      severity: 'HIGH',
      value: stats.pages.size,
    });
  }

  // Logger les patterns suspects
  if (suspiciousIndicators.length > 0) {
    logger.warn('Suspicious pagination patterns detected', {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path,
      query: req.query,
      indicators: suspiciousIndicators,
      timestamp: new Date().toISOString(),
    });

    // Ajouter aux headers pour monitoring
    res.setHeader('X-Suspicious-Pattern', 'true');
  }

  next();
};

/**
 * 📋 Middleware pour documenter la pagination
 */
export const paginationDocumentation = (req, res, next) => {
  // Ajouter des infos aux locals pour les templates
  res.locals.paginationInfo = {
    defaultLimit: AdvancedPaginationService.config.DEFAULT_LIMIT,
    maxLimit: AdvancedPaginationService.config.MAX_LIMIT,
    maxPage: AdvancedPaginationService.config.MAX_PAGE,
    cacheEnabled: AdvancedPaginationService.config.CACHE_PAGINATION_RESULTS,
    cursorPaginationEnabled: AdvancedPaginationService.config.ALLOW_CURSOR_PAGINATION,
  };

  next();
};

/**
 * ✅ Middleware pour ajouter les modèles à la requête
 */
export const attachModels = (models) => {
  return (req, res, next) => {
    req.models = models;
    next();
  };
};

/**
 * 🎯 Middleware composite pour l'intégration complète
 */
export const createPaginationProtectionStack = (models) => {
  return [
    paginationProtection,
    paginationRateLimit,
    detectSuspiciousPatterns,
    paginationDocumentation,
    attachModels(models),
  ];
};

/**
 * 🧹 Nettoyer le store de rate limit (appel périodique)
 */
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  const CLEANUP_WINDOW = 3600000; // 1 heure

  for (const [key, stats] of paginationRateLimitStore.entries()) {
    // Supprimer les entrées anciennes
    if (now - stats.firstRequestTime > CLEANUP_WINDOW) {
      paginationRateLimitStore.delete(key);
    }
  }

  logger.debug('Rate limit store cleanup completed', {
    remainingEntries: paginationRateLimitStore.size,
  });
};

// Nettoyer toutes les heures
setInterval(cleanupRateLimitStore, 3600000);
