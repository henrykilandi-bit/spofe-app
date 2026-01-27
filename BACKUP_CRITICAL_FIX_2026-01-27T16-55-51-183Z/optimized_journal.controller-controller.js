/**
 * Optimized Journal Controller
 * 
 * Contrôleur utilisant les stratégies d'optimisation des requêtes
 * pour éviter les N+1 queries et améliorer les performances
 * 
 * @module controllers/optimized-journal
 */

import QueryOptimizationService from '../services/query-optimization.service.js';
import logger from '../utils/logger.js';
import { success, error, badRequest } from '../utils/response.js';
import { journalEntryDto, journalEntryDtoArray, journalEntryLineDto, journalEntryLineDtoArray } from '../dto/index.js';

class OptimizedJournalController {
  /**
   * Récupérer les écritures avec pagination - OPTIMISÉ
   * 
   * Requêtes: 3 (entries, lines, count) au lieu de N+1
   * 
   * @route GET /api/journal-entries
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getEntries(req, res, next) {
    try {
      const compagnieId = req.user?.compagnie_id;
      if (!compagnieId) {
        return badRequest(res, 'Compagnie ID required', 400);
      }

      const {
        page = 1,
        limit = 50,
        startDate,
        endDate,
        status = 'posted',
        includeAccounts = false
      } = req.query;

      // Validation des paramètres
      const validatedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
      const validatedPage = Math.max(1, parseInt(page));

      // 🎯 UTILISER LE SERVICE D'OPTIMISATION
      const result = await QueryOptimizationService.getJournalEntriesWithLines(compagnieId, {
        page: validatedPage,
        limit: validatedLimit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        includeAccounts: includeAccounts === 'true'
      });

      logger.info('Journal entries fetched (optimized)', {
        user_id: req.user?.id,
        compagnieId,
        page: validatedPage,
        limit: validatedLimit,
        entryCount: result.entries.length,
        duration: result.metadata.duration,
        queryCount: result.metadata.queryCount
      });

      success(res, {
        entries: result.entries,
        pagination: result.pagination,
        metadata: {
          optimized: true,
          queryStrategy: 'batch_loading',
          queryCount: result.metadata.queryCount,
          duration: result.metadata.duration,
          cacheHit: result.metadata.cacheHit
        }
      });
    } catch (err) {
      logger.error('Error fetching journal entries', {
        user_id: req.user?.id,
        error: err.message,
        stack: err.stack
      });

      error(res, 'FETCH_ENTRIES_FAILED', 500, {
        message: 'Erreur lors de la récupération des écritures comptables'
      });
    }
  }

  /**
   * Récupérer une écriture avec ses lignes - OPTIMISÉ
   * 
   * Requêtes: 2 (entry + lines batch) au lieu de N+1
   * 
   * @route GET /api/journal-entries/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getEntryWithLines(req, res, next) {
    try {
      const { id } = req.params;
      const compagnieId = req.user?.compagnie_id;
      const user_id = req.user?.id;

      if (!id || !compagnieId) {
        return badRequest(res, 'ID and Compagnie ID required');
      }

      const startTime = Date.now();

      // 🎯 REQUÊTE 1: Récupérer l'écriture
      const entry = await global.sequelize.models.JournalEntry?.findOne({
        where: {
          id,
          compagnie_id: compagnieId,
          deleted_at: null
        },
        attributes: [
          'id',
          'numero_journal',
          'reference',
          'description',
          'entry_date',
          'status',
          'created_by',
          'posted_by',
          'created_at'
        ],
        subQuery: false
      });

      if (!entry) {
        logger.warn('Journal entry not found', { entryId: id, user_id });
        return error(res, 'ENTRY_NOT_FOUND', 404, {
          message: 'Écriture comptable non trouvée'
        });
      }

      // 🎯 REQUÊTE 2: Récupérer les lignes en une seule requête
      const lines = await global.sequelize.models.JournalEntryLine?.findAll({
        where: {
          journal_entry_id: id,
          deleted_at: null
        },
        include: [
          {
            model: global.sequelize.models.ChartOfAccount,
            as: 'account',
            attributes: ['id', 'numero_compte', 'nom', 'type_compte'],
            required: false
          }
        ],
        order: [['order_in_entry', 'ASC']],
        subQuery: false
      });

      const duration = Date.now() - startTime;

      // Assembler la réponse
      const responseData = {
        ...journalEntryDto(entry),
        lines: journalEntryLineDtoArray(lines)
      };

      logger.info('Journal entry fetched (optimized)', {
        user_id,
        entryId: id,
        lineCount: lines.length,
        duration,
        queryCount: 2
      });

      success(res, {
        entry: responseData,
        metadata: {
          optimized: true,
          queryCount: 2,
          lineCount: lines.length,
          duration
        }
      });
    } catch (err) {
      logger.error('Error fetching entry with lines', {
        entryId: req.params.id,
        user_id: req.user?.id,
        error: err.message
      });

      error(res, 'FETCH_ENTRY_FAILED', 500, {
        message: 'Erreur lors de la récupération de l\'écriture'
      });
    }
  }

  /**
   * Récupérer le rapport comptable - OPTIMISÉ
   * 
   * Requête: 1 (SQL directe avec agrégations) au lieu de N requêtes
   * 
   * @route GET /api/journal-entries/report/:periode
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getReport(req, res, next) {
    try {
      const { periode } = req.params;
      const compagnieId = req.user?.compagnie_id;
      const user_id = req.user?.id;

      if (!periode || !compagnieId) {
        return badRequest(res, 'Periode and Compagnie ID required');
      }

      // Valider le format de la période (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(periode)) {
        return badRequest(res, 'Invalid period format. Use YYYY-MM');
      }

      const startTime = Date.now();

      // 🎯 REQUÊTE OPTIMISÉE avec SQL directe et agrégations
      const reportResult = await QueryOptimizationService.getJournalEntriesForReport(compagnieId, periode);

      const duration = Date.now() - startTime;

      logger.info('Journal report generated (optimized)', {
        user_id,
        compagnieId,
        periode,
        entryCount: reportResult.data.length,
        duration,
        queryOptimization: reportResult.metadata.queryOptimization
      });

      success(res, {
        report: reportResult.data,
        metadata: {
          optimized: true,
          periode,
          entryCount: reportResult.data.length,
          duration,
          queryOptimization: reportResult.metadata.queryOptimization,
          cacheHit: reportResult.metadata.cacheHit
        }
      });
    } catch (err) {
      logger.error('Error generating report', {
        periode: req.params.periode,
        user_id: req.user?.id,
        error: err.message
      });

      error(res, 'REPORT_GENERATION_FAILED', 500, {
        message: 'Erreur lors de la génération du rapport'
      });
    }
  }

  /**
   * Récupérer les balances comptables - OPTIMISÉ
   * 
   * Requête: 1 (SQL CTE) au lieu de N requêtes
   * 
   * @route GET /api/account-balances
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getAccountBalances(req, res, next) {
    try {
      const compagnieId = req.user?.compagnie_id;
      const { startDate, endDate } = req.query;
      const user_id = req.user?.id;

      if (!compagnieId || !startDate || !endDate) {
        return badRequest(res, 'Compagnie ID, start date and end date required');
      }

      const startTime = Date.now();

      // 🎯 REQUÊTE OPTIMISÉE avec CTE SQL
      const balancesResult = await QueryOptimizationService.getAccountBalances(
        compagnieId,
        new Date(startDate),
        new Date(endDate)
      );

      const duration = Date.now() - startTime;

      logger.info('Account balances fetched (optimized)', {
        user_id,
        compagnieId,
        accountCount: balancesResult.data.length,
        duration,
        queryOptimization: balancesResult.metadata.queryOptimization
      });

      success(res, {
        balances: balancesResult.data,
        metadata: {
          optimized: true,
          accountCount: balancesResult.data.length,
          duration,
          queryOptimization: balancesResult.metadata.queryOptimization,
          dateRange: { startDate, endDate }
        }
      });
    } catch (err) {
      logger.error('Error fetching account balances', {
        user_id: req.user?.id,
        error: err.message
      });

      error(res, 'FETCH_BALANCES_FAILED', 500, {
        message: 'Erreur lors de la récupération des soldes comptables'
      });
    }
  }

  /**
   * Récupérer le journal détaillé d'un compte - OPTIMISÉ
   * 
   * @route GET /api/account-journal/:accountId
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getAccountJournal(req, res, next) {
    try {
      const { accountId } = req.params;
      const { periode, page = 1, limit = 100 } = req.query;
      const compagnieId = req.user?.compagnie_id;
      const user_id = req.user?.id;

      if (!accountId || !periode || !compagnieId) {
        return badRequest(res, 'Account ID, periode and Compagnie ID required');
      }

      const validatedLimit = Math.min(Math.max(1, parseInt(limit)), 500);
      const validatedPage = Math.max(1, parseInt(page));
      const offset = (validatedPage - 1) * validatedLimit;

      const startTime = Date.now();

      // 🎯 REQUÊTE SQL DIRECTE OPTIMISÉE
      const [journal] = await global.sequelize.query(`
        SELECT 
          DATE(je.entry_date) as date,
          je.reference,
          je.description,
          je.numero_journal,
          jel.montant_debit,
          jel.montant_credit,
          coa.numero_compte,
          coa.nom as compte_nom,
          u.username as created_by,
          je.id as entry_id
        FROM journal_entries je
        JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
        JOIN charts_of_accounts coa ON jel.numero_compte_id = coa.id
        LEFT JOIN users u ON je.created_by = u.id
        WHERE je.compagnie_id = ?
          AND DATE_FORMAT(je.entry_date, '%Y-%m') = ?
          AND coa.id = ?
          AND je.status = 'posted'
          AND je.deleted_at IS NULL
          AND jel.deleted_at IS NULL
        ORDER BY je.entry_date DESC, je.id DESC
        LIMIT ? OFFSET ?
      `, {
        replacements: [compagnieId, periode, accountId, validatedLimit, offset],
        type: global.sequelize.QueryTypes.SELECT
      });

      // Compter le total
      const [[{ total }]] = await global.sequelize.query(`
        SELECT COUNT(*) as total
        FROM journal_entries je
        JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
        WHERE je.compagnie_id = ?
          AND DATE_FORMAT(je.entry_date, '%Y-%m') = ?
          AND jel.numero_compte_id = ?
          AND je.status = 'posted'
          AND je.deleted_at IS NULL
      `, {
        replacements: [compagnieId, periode, accountId],
        type: global.sequelize.QueryTypes.SELECT
      });

      const duration = Date.now() - startTime;

      logger.info('Account journal fetched (optimized)', {
        user_id,
        accountId,
        periode,
        rowCount: journal.length,
        total,
        duration
      });

      success(res, {
        journal,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages: Math.ceil(total / validatedLimit),
          hasMore: validatedPage * validatedLimit < total
        },
        metadata: {
          optimized: true,
          duration,
          rowCount: journal.length,
          queryOptimization: 'direct_sql_pagination'
        }
      });
    } catch (err) {
      logger.error('Error fetching account journal', {
        accountId: req.params.accountId,
        user_id: req.user?.id,
        error: err.message
      });

      error(res, 'FETCH_JOURNAL_FAILED', 500, {
        message: 'Erreur lors de la récupération du journal du compte'
      });
    }
  }

  /**
   * Diagnostic de performance des requêtes
   * 
   * @route GET /api/diagnostic/query-performance
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getQueryDiagnostics(req, res, next) {
    try {
      const report = QueryOptimizationService.getDiagnosticReport();

      logger.info('Query diagnostics retrieved', {
        user_id: req.user?.id,
        nPlusOneDetections: report.performance.nPlusOneDetections
      });

      success(res, report);
    } catch (err) {
      logger.error('Error getting diagnostics', {
        error: err.message
      });

      error(res, 'DIAGNOSTIC_FAILED', 500);
    }
  }

  /**
   * Réinitialiser les statistiques de performances
   * 
   * @route POST /api/diagnostic/reset-stats
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async resetStatistics(req, res, next) {
    try {
      // Vérifier les permissions (admin seulement)
      if (req.user?.role !== 'admin') {
        return error(res, 'FORBIDDEN', 403, {
          message: 'Admin only'
        });
      }

      QueryOptimizationService.resetStats();

      logger.info('Query optimization stats reset', {
        user_id: req.user?.id,
        role: req.user?.role
      });

      success(res, {
        message: 'Statistics reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.error('Error resetting stats', {
        user_id: req.user?.id,
        error: err.message
      });

      error(res, 'RESET_FAILED', 500);
    }
  }
}

export default new OptimizedJournalController();
