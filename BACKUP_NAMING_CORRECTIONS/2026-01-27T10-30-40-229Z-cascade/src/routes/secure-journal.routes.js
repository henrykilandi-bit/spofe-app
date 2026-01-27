/**
 * Routes pour les endpoints sécurisés avec pagination avancée
 * 
 * Endpoints:
 * - GET /entries - Liste paginée des écritures
 * - GET /entries/:id - Détail d'une écriture
 * - GET /search - Recherche d'écritures
 * - GET /export - Export des données
 * - GET /stats - Statistiques (admin only)
 * - POST /stats/reset - Réinitialiser stats (admin only)
 * 
 * @author SPOFE Team
 * @version 2.1.0
 */

import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.middleware.js';
import SecureJournalController from '../controllers/secure-journal.controller.js';
import logger from '../utils/logger.js';

const router = express.Router();

// 🔐 MIDDLEWARE D'AUTHENTIFICATION POUR TOUTES LES ROUTES
router.use(authenticateToken);

// 📝 LOG DES REQUÊTES
router.use((req, res, next) => {
  logger.debug('Secure journal route accessed', {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    compagnieId: req.user?.compagnie_id,
    pagination: {
      page: req.query.page,
      limit: req.query.limit,
      cursor: !!req.query.cursor
    }
  });

  next();
});

/**
 * 📄 GET /entries
 * Récupérer la liste paginée des écritures
 * 
 * Query Parameters:
 * - page: number (default: 1, min: 1, max: 10000)
 * - limit: number (default: 50, max: 100)
 * - cursor: boolean (enable cursor pagination)
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - status: 'posted' | 'draft' | 'cancelled'
 * - reference: string (search term)
 * - journalType: string
 * 
 * Example:
 * GET /api/secure-journal/entries?page=1&limit=50&status=posted
 * 
 * Response:
 * {
 *   success: true,
 *   data: [{ id, reference, entry_date, status, lines: [...] }, ...],
 *   pagination: { page, limit, total, totalPages, hasMore, nextOffset },
 *   filters: { applied, available },
 *   metadata: { optimized, queryTime, cacheHit, timestamp }
 * }
 */
router.get('/entries', SecureJournalController.getJournalEntries);

/**
 * 📑 GET /entries/:id
 * Récupérer le détail d'une écriture avec ses lignes
 * 
 * Parameters:
 * - id: number (entry ID)
 * 
 * Example:
 * GET /api/secure-journal/entries/123
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id, reference, entry_date, description, status, 
 *     montant_total, lines: [...]
 *   }
 * }
 */
router.get('/entries/:id', SecureJournalController.getJournalEntryDetail);

/**
 * 🔍 GET /search
 * Rechercher les écritures avec pagination
 * 
 * Query Parameters:
 * - q: string (search term, required, min: 2, max: 100)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 50)
 * 
 * Example:
 * GET /api/secure-journal/search?q=facture&page=1&limit=20
 * 
 * Response:
 * {
 *   success: true,
 *   data: [...],
 *   pagination: {...},
 *   search: { term, found, resultCount, total }
 * }
 */
router.get('/search', SecureJournalController.searchJournalEntries);

/**
 * 📤 GET /export
 * Exporter les écritures (avec limitation de taille)
 * 
 * Query Parameters:
 * - format: 'csv' | 'json' (default: 'csv')
 * - startDate: ISO date string
 * - endDate: ISO date string
 * 
 * Limitations:
 * - Max 10,000 rows per export
 * - Max 365 days date range
 * 
 * Example:
 * GET /api/secure-journal/export?format=csv&startDate=2024-01-01&endDate=2024-12-31
 * 
 * Response:
 * File download (CSV or JSON)
 */
router.get('/export', SecureJournalController.exportJournalEntries);

/**
 * 📊 GET /stats
 * Obtenir les statistiques de pagination (admin only)
 * 
 * Authorization: Requires 'admin' or 'manager' role
 * 
 * Example:
 * GET /api/secure-journal/stats
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     pagination: {
 *       config: {...},
 *       statistics: {
 *         totalRequests, cacheHits, cacheMisses, slowQueries,
 *         cacheHitRate, suspiciousPatternRate
 *       },
 *       health: { status, issues, recommendations }
 *     }
 *   }
 * }
 */
router.get('/stats', authorize(['admin', 'manager']), SecureJournalController.getPaginationStats);

/**
 * 🔄 POST /stats/reset
 * Réinitialiser les statistiques de pagination (admin only)
 * 
 * Authorization: Requires 'admin' role
 * 
 * Example:
 * POST /api/secure-journal/stats/reset
 * 
 * Response:
 * {
 *   success: true,
 *   data: { message: 'Statistics reset successfully' }
 * }
 */
router.post('/stats/reset', authorize(['admin']), SecureJournalController.resetPaginationStats);

/**
 * 📖 GET /documentation
 * Obtenir la documentation des endpoints (public)
 * 
 * Response:
 * {
 *   title: 'Secure Journal Pagination API',
 *   version: '2.1.0',
 *   endpoints: [{...}],
 *   bestPractices: [...],
 *   limitations: {...}
 * }
 */
router.get('/documentation', (req, res) => {
  res.json({
    title: 'Secure Journal Pagination API',
    version: '2.1.0',
    baseUrl: '/api/secure-journal',
    authentication: 'Bearer token required',
    endpoints: {
      getEntries: {
        method: 'GET',
        path: '/entries',
        description: 'Get paginated list of journal entries',
        parameters: {
          page: { type: 'integer', default: 1, min: 1, max: 10000 },
          limit: { type: 'integer', default: 50, min: 1, max: 100 },
          cursor: { type: 'boolean', default: false },
          startDate: { type: 'string', format: 'YYYY-MM-DD' },
          endDate: { type: 'string', format: 'YYYY-MM-DD' },
          status: { type: 'string', enum: ['posted', 'draft', 'cancelled'] },
          reference: { type: 'string', minLength: 2, maxLength: 50 },
          journalType: { type: 'string' }
        },
        response: {
          status: 200,
          body: {
            success: true,
            data: [],
            pagination: {},
            filters: {},
            metadata: {}
          }
        }
      },
      getEntryDetail: {
        method: 'GET',
        path: '/entries/:id',
        description: 'Get detail of a specific entry',
        parameters: {
          id: { type: 'integer', required: true }
        }
      },
      search: {
        method: 'GET',
        path: '/search',
        description: 'Search entries with pagination',
        parameters: {
          q: { type: 'string', required: true, minLength: 2, maxLength: 100 },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20, max: 50 }
        }
      },
      export: {
        method: 'GET',
        path: '/export',
        description: 'Export entries (max 10,000 rows)',
        parameters: {
          format: { type: 'string', enum: ['csv', 'json'], default: 'csv' },
          startDate: { type: 'string', format: 'YYYY-MM-DD' },
          endDate: { type: 'string', format: 'YYYY-MM-DD' }
        }
      },
      getStats: {
        method: 'GET',
        path: '/stats',
        description: 'Get pagination statistics (admin only)',
        authorization: 'admin, manager'
      },
      resetStats: {
        method: 'POST',
        path: '/stats/reset',
        description: 'Reset pagination statistics (admin only)',
        authorization: 'admin'
      }
    },
    bestPractices: [
      'Always use pagination for list endpoints',
      'Use limit=50 by default for optimal performance',
      'Enable cursor pagination for large datasets',
      'Cache results when possible',
      'Never request more than MAX_LIMIT items',
      'Monitor cache hit rate',
      'Use appropriate date ranges for exports',
      'Implement exponential backoff for retries'
    ],
    limitations: {
      maxLimit: 100,
      maxPage: 10000,
      maxExportRows: 10000,
      maxExportDays: 365,
      defaultLimit: 50,
      cacheEnabled: true,
      cacheTTL: '300 seconds'
    },
    errors: {
      PAGINATION_REQUIRED: {
        status: 400,
        message: 'Pagination parameters are required'
      },
      INVALID_PAGINATION_PARAMS: {
        status: 400,
        message: 'Invalid pagination parameters'
      },
      RATE_LIMIT_EXCEEDED: {
        status: 429,
        message: 'Too many pagination requests'
      },
      SECURITY_ERROR: {
        status: 403,
        message: 'Access denied or security constraint violated'
      },
      EXPORT_TOO_LARGE: {
        status: 400,
        message: 'Export size exceeds maximum allowed'
      }
    }
  });
});

// 🔐 GESTION DES ERREURS LOCALES
router.use((error, req, res, next) => {
  logger.error('Secure journal route error', {
    error: error.message,
    path: req.path,
    userId: req.user?.id
  });

  if (error.code === 'AUTHENTICATION_REQUIRED') {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication is required for this endpoint'
    });
  }

  if (error.code === 'AUTHORIZATION_FAILED') {
    return res.status(403).json({
      success: false,
      error: 'AUTHORIZATION_FAILED',
      message: 'You do not have permission for this action'
    });
  }

  next(error);
});

export default router;
