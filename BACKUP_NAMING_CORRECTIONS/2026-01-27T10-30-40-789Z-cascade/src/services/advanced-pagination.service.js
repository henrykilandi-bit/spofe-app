/**
 * Service de Pagination Avancée et Sécurisée pour SPOFE
 * 
 * Fonctionnalités:
 * - Validation robuste des paramètres
 * - Contexte multi-tenant obligatoire
 * - Pagination offset et curseur
 * - Caching Redis intelligent
 * - Détection automatique de grandes tables
 * - Audit des accès
 * - Protection DOS/fuite données
 * 
 * @author SPOFE Team
 * @version 2.1.0
 */

import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import CacheService from './cache.service.js';
import SecurityAuditService from './security-audit.service.js';

class AdvancedPaginationService {
  constructor() {
    this.config = {
      DEFAULT_LIMIT: 50,
      MAX_LIMIT: 100,
      MAX_PAGE: 10000,
      ALLOW_CURSOR_PAGINATION: true,
      CACHE_PAGINATION_RESULTS: true,
      CACHE_TTL: 300,
      AUDIT_PAGINATION_ACCESS: true,
      ENABLE_SLOW_QUERY_ALERTS: true,
      SLOW_QUERY_THRESHOLD: 2000,
      LARGE_TABLE_THRESHOLD: 1000000
    };
    
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0,
      nPlusOneDetected: 0,
      suspiciousPatterns: 0
    };
  }

  /**
   * 🔐 Pagination sécurisée avec validation complète
   */
  async paginate(model, options = {}) {
    const {
      req,
      user,
      whereClause = {},
      include = [],
      order = [['id', 'DESC']],
      useCursorPagination = false,
      cursorField = 'id',
      previousCursor = null,
      configOverride = {}
    } = options;

    // Fusionner config override
    const config = { ...this.config, ...configOverride };

    // 📊 Statistiques
    this.stats.totalRequests++;

    // 🔐 VALIDATION ET SANITIZATION DES PARAMÈTRES
    const { page, limit, offset, validated } = this.validatePaginationParams(req, config);

    if (!validated) {
      logger.warn('Invalid pagination parameters', {
        ip: req?.ip,
        query: req?.query,
        userAgent: req?.get('User-Agent')
      });

      throw {
        code: 'VALIDATION_ERROR',
        message: 'Invalid pagination parameters',
        statusCode: 400
      };
    }

    // 🏢 CONTEXTE MULTI-TENANT OBLIGATOIRE
    if (!whereClause.compagnie_id && user?.compagnie_id) {
      whereClause.compagnie_id = user.compagnie_id;
    }

    if (!whereClause.compagnie_id) {
      logger.error('Missing compagnie_id context', {
        userId: user?.id,
        modelName: model?.name
      });

      throw {
        code: 'SECURITY_ERROR',
        message: 'Compagnie context required for pagination',
        statusCode: 403
      };
    }

    // 🔍 AUDIT DE L'ACCÈS
    if (config.AUDIT_PAGINATION_ACCESS) {
      try {
        await SecurityAuditService.recordPaginationAccess({
          userId: user?.id,
          compagnieId: whereClause.compagnie_id,
          model: model.name,
          page,
          limit,
          offset,
          ip: req?.ip,
          userAgent: req?.get('User-Agent'),
          endpoint: req?.path,
          timestamp: new Date().toISOString()
        });
      } catch (auditError) {
        logger.warn('Audit failed, continuing', { error: auditError.message });
      }
    }

    // 🎯 STRATÉGIE DE PAGINATION OPTIMISÉE
    if (useCursorPagination && config.ALLOW_CURSOR_PAGINATION) {
      return await this.cursorPaginate(model, {
        whereClause,
        include,
        order,
        limit,
        cursorField,
        previousCursor,
        config
      });
    }

    return await this.offsetPaginate(model, {
      whereClause,
      include,
      order,
      limit,
      offset,
      config
    });
  }

  /**
   * 📄 Pagination par offset (traditionnelle) OPTIMISÉE
   */
  async offsetPaginate(model, options) {
    const {
      whereClause,
      include,
      order,
      limit,
      offset,
      config
    } = options;

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('offset', model.name, whereClause, limit, offset);

    // 🔄 TENTATIVE DE CACHE
    if (config.CACHE_PAGINATION_RESULTS) {
      try {
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          logger.debug('Pagination cache hit', { model: model.name, limit, offset });
          this.stats.cacheHits++;
          return {
            ...cached,
            metadata: { ...cached.metadata, cacheHit: true }
          };
        }
        this.stats.cacheMisses++;
      } catch (cacheError) {
        logger.debug('Cache read failed, continuing', { error: cacheError.message });
      }
    }

    try {
      // 🚀 REQUÊTE OPTIMISÉE : Éviter COUNT(*) sur grandes tables
      let totalCount = null;
      let totalPages = null;
      let isEstimated = false;

      // Stratégie intelligente : seulement count si nécessaire
      const shouldCountTotal = offset === 0 || limit < 100;

      if (shouldCountTotal) {
        // OPTIMISATION : Estimation pour très grandes tables
        const isLargeTable = await this.isVeryLargeTable(model, whereClause);

        if (isLargeTable) {
          totalCount = await this.estimateCount(model, whereClause);
          isEstimated = true;

          logger.debug('Using table statistics for large table', {
            model: model.name,
            estimatedCount: totalCount
          });
        } else {
          totalCount = await model.count({ where: whereClause });
          isEstimated = false;
        }

        totalPages = Math.ceil(totalCount / limit);
      }

      // 📊 RÉCUPÉRATION DES DONNÉES (avec sécurité)
      const rows = await model.findAll({
        where: whereClause,
        include,
        limit,
        offset: Math.min(offset, config.MAX_PAGE * config.MAX_LIMIT),
        order,
        logging: logger.debug.bind(logger),
        benchmark: true
      });

      // Si pas de count total, vérifier s'il y a plus de données
      let hasMore = false;
      if (!shouldCountTotal && rows.length === limit) {
        // Vérifier rapide pour une ligne supplémentaire
        const nextRow = await model.findOne({
          where: whereClause,
          offset: offset + limit,
          limit: 1,
          attributes: ['id']
        });
        hasMore = !!nextRow;
      }

      const queryTime = Date.now() - startTime;

      // ⚠️ ALERTE PAGINATION LENTE
      if (config.ENABLE_SLOW_QUERY_ALERTS && queryTime > config.SLOW_QUERY_THRESHOLD) {
        this.stats.slowQueries++;

        logger.warn('Slow pagination detected', {
          model: model.name,
          queryTime,
          limit,
          offset,
          compagnieId: whereClause.compagnie_id,
          rowsReturned: rows.length
        });
      }

      const result = {
        data: rows,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          offset,
          total: totalCount,
          totalPages,
          hasMore: shouldCountTotal ? (offset + limit) < totalCount : hasMore,
          nextOffset: hasMore ? offset + limit : null
        },
        metadata: {
          model: model.name,
          queryTime,
          cacheHit: false,
          estimatedCount: isEstimated,
          timestamp: new Date().toISOString()
        }
      };

      // 💾 MISE EN CACHE STRATÉGIQUE
      if (config.CACHE_PAGINATION_RESULTS && rows.length > 0) {
        try {
          await CacheService.set(cacheKey, result, config.CACHE_TTL);
        } catch (cacheError) {
          logger.warn('Cache write failed', { error: cacheError.message });
        }
      }

      return result;

    } catch (error) {
      logger.error('Pagination error', {
        model: model.name,
        error: error.message,
        whereClause: JSON.stringify(whereClause),
        limit,
        offset
      });

      throw {
        code: 'PAGINATION_FAILED',
        message: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * 🎯 Pagination par curseur (meilleure performance)
   */
  async cursorPaginate(model, options) {
    const {
      whereClause,
      include,
      order,
      limit,
      cursorField,
      previousCursor,
      config
    } = options;

    try {
      const cursorWhere = { ...whereClause };

      // Construction de la clause WHERE basée sur le curseur
      if (previousCursor) {
        // Pour l'ordre DESC : id < previousCursor
        // Pour l'ordre ASC : id > previousCursor
        const [field, direction] = order[0];
        const operator = direction === 'DESC' ? Op.lt : Op.gt;

        cursorWhere[cursorField] = {
          [operator]: previousCursor
        };
      }

      const rows = await model.findAll({
        where: cursorWhere,
        include,
        limit: limit + 1, // Prendre une de plus pour savoir s'il y a une suite
        order
      });

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, -1) : rows;

      const nextCursor = data.length > 0
        ? data[data.length - 1][cursorField]
        : null;

      return {
        data,
        pagination: {
          limit,
          hasMore,
          nextCursor,
          previousCursor,
          total: null,
          type: 'cursor'
        },
        metadata: {
          model: model.name,
          cursorField,
          order: order[0],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Cursor pagination error', {
        model: model.name,
        error: error.message,
        cursorField,
        previousCursor
      });

      throw {
        code: 'CURSOR_PAGINATION_FAILED',
        message: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * 🔒 Validation robuste des paramètres de pagination
   */
  validatePaginationParams(req, config) {
    let page = 1;
    let limit = config.DEFAULT_LIMIT;
    let offset = 0;
    let validated = true;

    // 🔒 VALIDATION PAGE
    if (req?.query.page) {
      const pageParam = parseInt(req.query.page, 10);

      if (isNaN(pageParam) || pageParam < 1) {
        validated = false;
        logger.warn('Invalid page parameter', {
          received: req.query.page,
          ip: req.ip
        });
      } else if (pageParam > config.MAX_PAGE) {
        page = config.MAX_PAGE;
        logger.warn('Page parameter capped', {
          requested: pageParam,
          capped: config.MAX_PAGE,
          ip: req.ip,
          path: req.path
        });
      } else {
        page = pageParam;
      }
    }

    // 🔒 VALIDATION LIMIT
    if (req?.query.limit) {
      const limitParam = parseInt(req.query.limit, 10);

      if (isNaN(limitParam) || limitParam < 1) {
        validated = false;
        logger.warn('Invalid limit parameter', {
          received: req.query.limit,
          ip: req.ip
        });
      } else if (limitParam > config.MAX_LIMIT) {
        limit = config.MAX_LIMIT;
        logger.warn('Limit parameter capped', {
          requested: limitParam,
          capped: config.MAX_LIMIT,
          ip: req.ip
        });
      } else {
        limit = limitParam;
      }
    }

    // 🛡️ PROTECTION CONTRE OFFSET TROP GRAND
    offset = (page - 1) * limit;
    const maxOffset = config.MAX_PAGE * config.MAX_LIMIT;

    if (offset > maxOffset) {
      offset = maxOffset;
      page = Math.floor(maxOffset / limit) + 1;

      logger.warn('Offset too large, capped', {
        requestedOffset: (page - 1) * limit,
        cappedOffset: offset,
        ip: req?.ip,
        potentialAttack: true
      });

      // 🚨 ALERTE SÉCURITÉ
      this.stats.suspiciousPatterns++;

      if (req && SecurityAuditService) {
        try {
          SecurityAuditService.recordSuspiciousActivity({
            type: 'PAGINATION_DOS_ATTEMPT',
            ip: req.ip,
            requestedPage: req.query.page,
            requestedLimit: req.query.limit,
            cappedTo: { page, limit, offset },
            timestamp: new Date().toISOString()
          });
        } catch (auditError) {
          logger.warn('Could not record suspicious activity', { error: auditError.message });
        }
      }
    }

    return { page, limit, offset, validated };
  }

  /**
   * 📊 Estimation de count pour très grandes tables
   */
  async estimateCount(model, whereClause) {
    try {
      // Utiliser les statistiques MySQL pour estimation rapide
      const [result] = await model.sequelize.query(`
        SELECT TABLE_ROWS as estimated_count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `, {
        replacements: [model.getTableName()],
        type: model.sequelize.QueryTypes.SELECT
      });

      return result?.estimated_count || 0;
    } catch (error) {
      logger.warn('Table statistics not available, falling back to count', {
        table: model.getTableName(),
        error: error.message
      });

      return await model.count({ where: whereClause });
    }
  }

  /**
   * 🔍 Vérifier si la table est très grande
   */
  async isVeryLargeTable(model, whereClause) {
    try {
      const count = await this.estimateCount(model, whereClause);
      return count > this.config.LARGE_TABLE_THRESHOLD;
    } catch {
      return false;
    }
  }

  /**
   * 🔑 Générer clé de cache
   */
  generateCacheKey(type, modelName, whereClause, limit, offset) {
    const whereKey = JSON.stringify(whereClause);
    const hash = require('crypto')
      .createHash('md5')
      .update(whereKey)
      .digest('hex')
      .substring(0, 8);

    return `pagination:${type}:${modelName}:${limit}:${offset}:${hash}`;
  }

  /**
   * 📊 Obtenir les statistiques
   */
  getStatistics() {
    const hitRate = this.stats.totalRequests > 0
      ? ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      cacheHitRate: `${hitRate}%`,
      suspiciousPatternRate: this.stats.totalRequests > 0
        ? ((this.stats.suspiciousPatterns / this.stats.totalRequests) * 100).toFixed(2)
        : 0
    };
  }

  /**
   * 🔄 Réinitialiser les statistiques
   */
  resetStatistics() {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0,
      nPlusOneDetected: 0,
      suspiciousPatterns: 0
    };

    logger.info('Pagination statistics reset');
  }

  /**
   * 🔗 Middleware de pagination automatique
   */
  paginationMiddleware() {
    return (req, res, next) => {
      // Attacher le service à la requête
      req.paginate = async (model, options = {}) => {
        return await this.paginate(model, {
          req,
          user: req.user,
          ...options
        });
      };

      // Validation des paramètres de pagination
      const { validated } = this.validatePaginationParams(
        req,
        this.config
      );

      if (!validated) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAGINATION_PARAMS',
          message: 'Les paramètres de pagination sont invalides',
          validParams: {
            page: 'number >= 1',
            limit: `number between 1 and ${this.config.MAX_LIMIT}`,
            maxPage: this.config.MAX_PAGE
          }
        });
      }

      next();
    };
  }

  /**
   * 📈 Rapport de diagnostiques
   */
  getDiagnosticReport() {
    return {
      pagination: {
        config: this.config,
        statistics: this.getStatistics(),
        health: this.getHealthStatus()
      }
    };
  }

  /**
   * 🏥 Déterminer statut santé
   */
  getHealthStatus() {
    const stats = this.getStatistics();
    const hitRate = parseFloat(stats.cacheHitRate);
    const suspiciousRate = parseFloat(stats.suspiciousPatternRate);

    let status = 'HEALTHY';
    let issues = [];

    if (stats.slowQueries > stats.totalRequests * 0.1) {
      status = 'DEGRADED';
      issues.push('High slow query rate detected');
    }

    if (suspiciousRate > 5) {
      status = 'WARNING';
      issues.push('Suspicious pagination patterns detected');
    }

    if (hitRate < 20 && stats.totalRequests > 100) {
      status = 'DEGRADED';
      issues.push('Cache hit rate too low');
    }

    return {
      status,
      issues,
      recommendations: this.getRecommendations(status, stats)
    };
  }

  /**
   * 💡 Générer recommandations
   */
  getRecommendations(status, stats) {
    const recommendations = [];

    if (stats.slowQueries > 0) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        message: 'Add indexes on frequently paginated columns',
        action: 'Review slow query logs and add appropriate indexes'
      });
    }

    if (parseFloat(stats.cacheHitRate) < 20) {
      recommendations.push({
        type: 'CACHING',
        priority: 'MEDIUM',
        message: 'Cache hit rate is low, consider increasing TTL',
        action: 'Analyze cache key distribution and adjust CACHE_TTL'
      });
    }

    if (parseFloat(stats.suspiciousPatternRate) > 5) {
      recommendations.push({
        type: 'SECURITY',
        priority: 'CRITICAL',
        message: 'Suspicious pagination patterns detected',
        action: 'Review and adjust MAX_PAGE and MAX_LIMIT values'
      });
    }

    return recommendations;
  }
}

export default new AdvancedPaginationService();
