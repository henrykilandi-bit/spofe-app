/**
 * 🎯 Contrôleur d'Approbation
 * Gère les demandes d'approbation pour les super utilisateurs
 * Utilise PendingRoleApproval et ApprovalProcessingService pour workflow complet
 */

import sequelize from '../config/database.js';
import logger from '../utils/logger.js';
import { success, error as sendError } from '../utils/response.js';
import ApprovalProcessingService from '../services/approvalProcessingService.js';

const PendingApproval = sequelize.models.PendingApproval;
const PendingRoleApproval = sequelize.models.PendingRoleApproval;
const AuditLog = sequelize.models.AuditLog;
const User = sequelize.models.User;

class ApprovalsController {
  /**
   * 📊 Récupérer les statistiques d'approbation
   * GET /api/admin/approvals/stats
   */
  static async getStats(req, res) {
    try {
      const user_id = req.user?.id;

      // Vérifier que l'utilisateur est admin ou super utilisateur
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_utilisateur') {
        return sendError(res, 'Accès refusé', 403);
      }

      // Récupérer les statistiques depuis PendingRoleApproval
      const totalPending = await PendingRoleApproval.count({ where: { status: 'pending' } });
      const totalApproved = await PendingRoleApproval.count({ where: { status: 'approved' } });
      const totalRejected = await PendingRoleApproval.count({ where: { status: 'rejected' } });

      // Récupérer l'activité récente
      const recentActivity = await PendingRoleApproval.count({
        where: sequelize.where(
          sequelize.fn('DATE_SUB', sequelize.fn('NOW'), sequelize.literal('INTERVAL 7 DAY')),
          sequelize.Op.lte,
          sequelize.col('created_at')
        )
      });

      const stats = {
        totalPending,
        totalApproved,
        totalRejected,
        recentActivity,
        approvalRate: totalApproved > 0 
          ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100)
          : 0
      };

      logger.info('Approval stats retrieved', { user_id, stats });
      return success(res, stats, 200, 'Statistiques d\'approbation');
    } catch (err) {
      logger.error('Error getting approval stats', { error: err.message });
      return sendError(res, 'Erreur lors de la récupération des statistiques', 500);
    }
  }

  /**
   * 📋 Récupérer les approbations en attente
   * GET /api/admin/approvals/pending
   */
  static async getPendingApprovals(req, res) {
    try {
      const { limit = 20, offset = 0, status = 'pending', sortBy = 'created_at', order = 'DESC' } = req.query;

      // Vérifier les permissions
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_utilisateur') {
        return sendError(res, 'Accès refusé', 403);
      }

      const allowedSortBy = ['created_at', 'email', 'status', 'approved_at'];
      const sortColumn = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = ['ASC', 'DESC'].includes(order?.toUpperCase()) ? order : 'DESC';

      // Récupérer les approbations depuis PendingRoleApproval
      const approvals = await PendingRoleApproval.findAll({
        where: { status },
        attributes: ['id', 'email', 'prenom', 'nom', 'username', 'role', 'approver_role', 'status', 'created_at', 'approved_at', 'approval_notes', 'approved_by'],
        order: [[sortColumn, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Récupérer le total
      const total = await PendingRoleApproval.count({ where: { status } });

      logger.info('Pending approvals retrieved', { user_id: req.user?.id, count: approvals.length });

      return success(res, {
        approvals,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }, 200, 'Approbations en attente');
    } catch (err) {
      logger.error('Error getting pending approvals', { error: err.message });
      return sendError(res, 'Erreur lors de la récupération des approbations', 500);
    }
  }

  /**
   * ✅ Approuver une demande
   * POST /api/admin/approvals/:id/approve
   */
  static async approveApproval(req, res) {
    try {
      const { id } = req.params;
      const { notes = '' } = req.body;
      const user_id = req.user?.id;

      // Vérifier les permissions
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_utilisateur') {
        return sendError(res, 'Accès refusé', 403);
      }

      // Traiter l'approbation avec le nouveau service
      const result = await ApprovalProcessingService.approveRoleRequest(id, user_id, notes);

      if (!result.success) {
        return sendError(res, result.message, result.error === 'APPROVAL_NOT_FOUND' ? 404 : 400);
      }

      logger.info('Approval processed successfully', { 
        approvalId: id, 
        user_id, 
        newUserId: result.user_id,
        role: result.role
      });

      return success(res, {
        id,
        user_id: result.user_id,
        email: result.email,
        role: result.role,
        status: 'approved',
        approvedAt: new Date()
      }, 200, 'Approbation accordée et utilisateur activé avec succès');
    } catch (err) {
      logger.error('Error approving', { error: err.message });
      return sendError(res, 'Erreur lors de l\'approbation', 500);
    }
  }

  /**
   * ❌ Rejeter une demande
   * POST /api/admin/approvals/:id/reject
   */
  static async rejectApproval(req, res) {
    try {
      const { id } = req.params;
      const { reason = 'Raison non spécifiée' } = req.body;
      const user_id = req.user?.id;

      // Vérifier les permissions
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_utilisateur') {
        return sendError(res, 'Accès refusé', 403);
      }

      // Traiter le rejet
      const result = await ApprovalProcessingService.rejectRoleRequest(id, user_id, reason);

      if (!result.success) {
        return sendError(res, result.message, result.error === 'APPROVAL_NOT_FOUND' ? 404 : 400);
      }

      logger.info('Approval rejected successfully', { 
        approvalId: id, 
        user_id,
        reason
      });

      return success(res, { 
        id, 
        status: 'rejected', 
        rejectedAt: new Date() 
      }, 200, 'Demande rejetée avec succès');
    } catch (err) {
      logger.error('Error rejecting', { error: err.message });
      return sendError(res, 'Erreur lors du rejet', 500);
    }
  }

  /**
   * 🔍 Demander des modifications
   * POST /api/admin/approvals/:id/request-changes
   */
  static async requestChanges(req, res) {
    try {
      const { id } = req.params;
      const { changes = '' } = req.body;
      const user_id = req.user?.id;

      // Vérifier les permissions
      if (req.user?.role !== 'admin') {
        return sendError(res, 'Accès refusé', 403);
      }

      // Récupérer l'approbation
      const [approval] = await sequelize.query(`
        SELECT * FROM pending_approvals WHERE id = ?
      `, {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      });

      if (!approval) {
        return sendError(res, 'Approbation non trouvée', 404);
      }

      // Mettre à jour le statut
      await sequelize.query(`
        UPDATE pending_approvals
        SET 
          status = 'changes_requested',
          validation_notes = ?,
          updated_at = NOW()
        WHERE id = ?
      `, {
        replacements: [changes, id]
      });

      // Insérer dans audit logs
      await sequelize.query(`
        INSERT INTO approval_audit_logs (pending_approval_id, action, action_by, comment)
        VALUES (?, 'changes_requested', ?, ?)
      `, {
        replacements: [id, user_id, changes]
      });

      logger.info('Changes requested', { approvalId: id, user_id });

      return success(res, { id, status: 'changes_requested' }, 200, 'Modifications demandées');
    } catch (err) {
      logger.error('Error requesting changes', { error: err.message });
      return sendError(res, 'Erreur lors de la demande de modifications', 500);
    }
  }

  /**
   * 📜 Récupérer les logs d'audit
   * GET /api/admin/audit-logs
   */
  static async getAuditLogs(req, res) {
    try {
      const { limit = 50, offset = 0, approvalId = null, action = null } = req.query;

      // Vérifier les permissions
      if (req.user?.role !== 'admin') {
        return sendError(res, 'Accès refusé', 403);
      }

      let query = 'SELECT * FROM approval_audit_logs WHERE 1=1';
      const replacements = [];

      if (approvalId) {
        query += ' AND pending_approval_id = ?';
        replacements.push(approvalId);
      }

      if (action) {
        query += ' AND action = ?';
        replacements.push(action);
      }

      query += ' ORDER BY action_date DESC LIMIT ? OFFSET ?';
      replacements.push(parseInt(limit), parseInt(offset));

      const [logs] = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      // Récupérer les informations d'utilisateur pour chaque log
      const logsWithUser = await Promise.all(logs.map(async (log) => {
        const [user] = await sequelize.query(`
          SELECT id, username, email FROM users WHERE id = ?
        `, {
          replacements: [log.action_by],
          type: sequelize.QueryTypes.SELECT
        });
        return {
          ...log,
          actionByUser: user?.[0] || null
        };
      }));

      logger.info('Audit logs retrieved', { user_id: req.user?.id, count: logs.length });

      return success(res, { logs: logsWithUser, pagination: { limit: parseInt(limit), offset: parseInt(offset) } }, 200, 'Logs d\'audit');
    } catch (err) {
      logger.error('Error getting audit logs', { error: err.message });
      return sendError(res, 'Erreur lors de la récupération des logs', 500);
    }
  }

  /**
   * 📈 Approbations groupées par statut
   * GET /api/admin/approvals/breakdown/status
   */
  static async getStatusBreakdown(req, res) {
    try {
      // Vérifier les permissions
      if (req.user?.role !== 'admin') {
        return sendError(res, 'Accès refusé', 403);
      }

      const [breakdown] = await sequelize.query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100 / (SELECT COUNT(*) FROM pending_approvals), 2) as percentage
        FROM pending_approvals
        GROUP BY status
      `);

      logger.info('Status breakdown retrieved', { user_id: req.user?.id });

      return success(res, breakdown, 200, 'Répartition par statut');
    } catch (err) {
      logger.error('Error getting status breakdown', { error: err.message });
      return sendError(res, 'Erreur lors de la récupération du breakdown', 500);
    }
  }
}

export default ApprovalsController;
