/**
 * Contrôleurs SÉCURISÉS avec Pagination Avancée pour Journal Comptable
 * 
 * Endpoints:
 * - GET /api/secure-journal/entries - Liste paginée des écritures
 * - GET /api/secure-journal/entries/:id - Détail d'une écriture
 * - GET /api/secure-journal/search - Recherche d'écritures
 * - GET /api/secure-journal/export - Export des écritures
 * - GET /api/secure-journal/stats - Statistiques de pagination
 * 
 * @author SPOFE Team
 * @version 2.1.0
 */

import { Op } from 'sequelize';
import AdvancedPaginationService from '../services/advanced-pagination.service.js';
import logger from '../utils/logger.js';
import { success, error as errorResponse, unauthorized } from '../utils/response.js';

class SecureJournalController {

  /**
   * 📄 Obtenir les écritures paginées
   */
  async getJournalEntries(req, res) {
    try {
      const { compagnie_id } = req.user;
      
      if (!compagnie_id) {
        return unauthorized(res, 'Compagnie context required');
      }

      // 🔍 FILTRES OPTIONNELS VALIDÉS
      const filters = {
        compagnie_id,
        deleted_at: null
      };

      // Filtre par date
      if (req.query.startDate && req.query.endDate) {
        try {
          const startDate = new Date(req.query.startDate);
          const endDate = new Date(req.query.endDate);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return errorResponse(res, 'INVALID_DATE_FORMAT', 400, {
              format: 'YYYY-MM-DD'
            });
          }

          filters.entry_date = {
            [Op.between]: [startDate, endDate]
          };
        } catch (dateError) {
          logger.warn('Date filter error', { error: dateError.message });
          // Continuer sans filtre de date
        }
      }

      // Filtre par statut
      if (req.query.status) {
        const validStatuses = ['posted', 'draft', 'cancelled'];
        
        if (!validStatuses.includes(req.query.status)) {
          return errorResponse(res, 'INVALID_STATUS', 400, {
            validStatuses
          });
        }

        filters.status = req.query.status;
      }

      // Filtre par référence
      if (req.query.reference && req.query.reference.length >= 2) {
        if (req.query.reference.length > 50) {
          return errorResponse(res, 'REFERENCE_TOO_LONG', 400);
        }

        filters.reference = {
          [Op.like]: `%${req.query.reference}%`
        };
      }

      // Filtre par type de journal
      if (req.query.journalType) {
        filters.journal_type = req.query.journalType;
      }

      // 🎯 PAGINATION SÉCURISÉE
      const result = await req.paginate(req.models.JournalEntry, {
        whereClause: filters,
        include: [{
          model: req.models.JournalEntryLine,
          as: 'lines',
          attributes: ['id', 'account_id', 'montant_debit', 'montant_credit'],
          required: false
        }],
        order: [
          ['entry_date', 'DESC'],
          ['id', 'DESC']
        ],
        useCursorPagination: req.query.cursor === 'true',
        cursorField: 'id'
      });

      // 📊 LOG DE PERFORMANCE
      logger.info('Journal entries retrieved', {
        user_id: req.user.id,
        compagnieId: compagnie_id,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        queryTime: result.metadata?.queryTime,
        cacheHit: result.metadata?.cacheHit,
        rowsReturned: result.data.length
      });

      // 📦 RÉPONSE STRUCTURÉE
      return success(res, {
        data: result.data,
        pagination: result.pagination,
        filters: {
          applied: {
            compagnieId: compagnie_id,
            status: filters.status || null,
            dateRange: filters.entry_date ? {
              from: req.query.startDate,
              to: req.query.endDate
            } : null,
            reference: req.query.reference || null
          },
          available: ['startDate', 'endDate', 'status', 'reference', 'journalType', 'cursor']
        },
        metadata: {
          optimized: true,
          ...result.metadata
        }
      }, 200, 'Journal entries retrieved successfully');

    } catch (error) {
      logger.error('Error retrieving journal entries', {
        error: error.message,
        code: error.code,
        user_id: req.user?.id,
        compagnieId: req.user?.compagnie_id,
        query: req.query
      });

      if (error.code === 'SECURITY_ERROR') {
        return errorResponse(res, error.message, 403);
      }

      if (error.code === 'VALIDATION_ERROR') {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'PAGINATION_FAILED', 500, {
        message: error.message
      });
    }
  }

  /**
   * 📑 Obtenir détail d'une écriture
   */
  async getJournalEntryDetail(req, res) {
    try {
      const { id } = req.params;
      const { compagnie_id } = req.user;

      // Valider ID
      if (!id || isNaN(parseInt(id))) {
        return errorResponse(res, 'INVALID_ENTRY_ID', 400);
      }

      const entry = await req.models.JournalEntry.findOne({
        where: {
          id: parseInt(id),
          compagnie_id,
          deleted_at: null
        },
        include: [{
          model: req.models.JournalEntryLine,
          as: 'lines',
          required: false
        }]
      });

      if (!entry) {
        return errorResponse(res, 'ENTRY_NOT_FOUND', 404);
      }

      logger.info('Journal entry detail retrieved', {
        user_id: req.user.id,
        entryId: id,
        compagnieId: compagnie_id
      });

      return success(res, entry, 200, 'Journal entry retrieved successfully');

    } catch (error) {
      logger.error('Error retrieving journal entry detail', {
        error: error.message,
        entryId: req.params.id,
        user_id: req.user?.id
      });

      return errorResponse(res, 'RETRIEVAL_FAILED', 500);
    }
  }

  /**
   * 🔍 Rechercher des écritures
   */
  async searchJournalEntries(req, res) {
    try {
      const { compagnie_id } = req.user;
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return errorResponse(res, 'SEARCH_TERM_REQUIRED', 400);
      }

      if (searchTerm.length < 2) {
        return errorResponse(res, 'SEARCH_TERM_TOO_SHORT', 400, {
          minLength: 2
        });
      }

      if (searchTerm.length > 100) {
        return errorResponse(res, 'SEARCH_TERM_TOO_LONG', 400, {
          maxLength: 100
        });
      }

      // 🔍 RECHERCHE FULL-TEXT optimisée
      const whereClause = {
        compagnie_id,
        deleted_at: null,
        [Op.or]: [
          { reference: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
          { numero_journal: { [Op.like]: `%${searchTerm}%` } }
        ]
      };

      // 🎯 PAGINATION avec limite réduite pour recherche
      const result = await req.paginate(req.models.JournalEntry, {
        whereClause,
        order: [
          ['entry_date', 'DESC'],
          ['id', 'DESC']
        ],
        configOverride: {
          MAX_PAGE: 100,
          DEFAULT_LIMIT: 20,
          MAX_LIMIT: 50
        }
      });

      // 📊 METRIQUES RECHERCHE
      logger.info('Journal entries search executed', {
        user_id: req.user.id,
        compagnieId: compagnie_id,
        searchTerm: searchTerm.substring(0, 20), // Log truncated
        resultCount: result.data.length,
        totalResults: result.pagination.total,
        queryTime: result.metadata?.queryTime
      });

      return success(res, {
        data: result.data,
        pagination: result.pagination,
        search: {
          term: searchTerm,
          found: result.data.length > 0,
          resultCount: result.data.length,
          total: result.pagination.total
        },
        metadata: result.metadata
      }, 200, 'Search completed successfully');

    } catch (error) {
      logger.error('Error searching journal entries', {
        error: error.message,
        searchTerm: req.query.q?.substring(0, 20),
        user_id: req.user?.id
      });

      return errorResponse(res, 'SEARCH_FAILED', 500);
    }
  }

  /**
   * 📤 Exporter les écritures
   */
  async exportJournalEntries(req, res) {
    try {
      const { compagnie_id } = req.user;
      const { format = 'csv', startDate, endDate } = req.query;

      // ⚠️ LIMITATION POUR LES EXPORTS
      const MAX_EXPORT_ROWS = 10000;

      // 🏢 CONTEXTE MULTI-TENANT
      const whereClause = {
        compagnie_id,
        deleted_at: null,
        status: 'posted'
      };

      // Validation et filtre de date
      if (startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return errorResponse(res, 'INVALID_DATE_FORMAT', 400);
          }

          const daysDiff = (end - start) / (1000 * 60 * 60 * 24);

          // Limiter la période d'export
          if (daysDiff > 365) {
            return errorResponse(res, 'EXPORT_PERIOD_TOO_LONG', 400, {
              maxDays: 365,
              requestedDays: daysDiff
            });
          }

          whereClause.entry_date = {
            [Op.between]: [start, end]
          };
        } catch (dateError) {
          return errorResponse(res, 'INVALID_DATE_RANGE', 400);
        }
      }

      // 📊 ESTIMATION DU NOMBRE DE LIGNES
      const estimatedCount = await req.models.JournalEntry.count({ where: whereClause });

      if (estimatedCount > MAX_EXPORT_ROWS) {
        return errorResponse(res, 'EXPORT_TOO_LARGE', 400, {
          rowCount: estimatedCount,
          maxRows: MAX_EXPORT_ROWS,
          suggestion: 'Reduce date range or use pagination API'
        });
      }

      // 📥 RÉCUPÉRATION PAR LOT (batch) pour éviter la mémoire
      const batchSize = 1000;
      let allEntries = [];

      for (let offset = 0; offset < estimatedCount; offset += batchSize) {
        const entries = await req.models.JournalEntry.findAll({
          where: whereClause,
          limit: batchSize,
          offset,
          order: [['entry_date', 'ASC']],
          attributes: [
            'id',
            'entry_date',
            'reference',
            'description',
            'status',
            'montant_total'
          ],
          raw: true
        });

        allEntries = allEntries.concat(entries);
      }

      // 📤 FORMATAGE DE L'EXPORT
      let exportData;
      let contentType = 'text/csv';
      let filename = `journal-entries-${Date.now()}.csv`;

      switch (format) {
        case 'csv':
          exportData = this.formatAsCSV(allEntries);
          contentType = 'text/csv';
          filename = `journal-entries-${Date.now()}.csv`;
          break;

        case 'json':
          exportData = JSON.stringify(allEntries, null, 2);
          contentType = 'application/json';
          filename = `journal-entries-${Date.now()}.json`;
          break;

        default:
          return errorResponse(res, 'INVALID_EXPORT_FORMAT', 400, {
            supported: ['csv', 'json']
          });
      }

      // 📝 LOG D'EXPORT
      logger.info('Journal entries exported', {
        user_id: req.user.id,
        compagnieId: compagnie_id,
        format,
        rowCount: allEntries.length,
        startDate,
        endDate,
        fileSize: Buffer.byteLength(exportData)
      });

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      logger.error('Error exporting journal entries', {
        error: error.message,
        user_id: req.user?.id,
        format: req.query.format
      });

      return errorResponse(res, 'EXPORT_FAILED', 500);
    }
  }

  /**
   * 📊 Obtenir statistiques de pagination
   */
  async getPaginationStats(req, res) {
    try {
      // Vérifier l'autorisation (admin only)
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return unauthorized(res, 'Admin access required');
      }

      const stats = AdvancedPaginationService.getDiagnosticReport();

      logger.info('Pagination stats requested', {
        user_id: req.user.id,
        role: req.user.role
      });

      return success(res, stats, 200, 'Pagination statistics retrieved');

    } catch (error) {
      logger.error('Error retrieving pagination stats', {
        error: error.message,
        user_id: req.user?.id
      });

      return errorResponse(res, 'STATS_RETRIEVAL_FAILED', 500);
    }
  }

  /**
   * 🔄 Réinitialiser statistiques (admin only)
   */
  async resetPaginationStats(req, res) {
    try {
      // Vérifier l'autorisation (admin only)
      if (req.user?.role !== 'admin') {
        return unauthorized(res, 'Admin access required');
      }

      AdvancedPaginationService.resetStatistics();

      logger.warn('Pagination statistics reset by admin', {
        user_id: req.user.id,
        timestamp: new Date().toISOString()
      });

      return success(res, { message: 'Statistics reset successfully' }, 200);

    } catch (error) {
      logger.error('Error resetting pagination stats', {
        error: error.message,
        user_id: req.user?.id
      });

      return errorResponse(res, 'STATS_RESET_FAILED', 500);
    }
  }

  /**
   * 🔀 Formater données en CSV
   */
  formatAsCSV(entries) {
    if (!entries || entries.length === 0) {
      return '';
    }

    // En-têtes
    const headers = Object.keys(entries[0]);
    const csvHeaders = headers.map(h => `"${h}"`).join(',');

    // Lignes
    const csvRows = entries.map(entry => {
      return headers.map(header => {
        const value = entry[header];

        // Échapper les guillemets et sauts de ligne
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }

        if (value === null || value === undefined) {
          return '';
        }

        return `"${value}"`;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }
}

export default new SecureJournalController();
