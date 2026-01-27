/**
 * GroupApprovalService
 * Gère le workflow d'approbation des inscriptions par groupe
 */

const { PendingApproval, User, GroupeEntreprise, GroupeSuperUser } = require('../models');
const { logInfo, logError, logSecurity } = require('../utils/logger');

class GroupApprovalService {
  /**
   * Créer une approbation en attente pour nouvelle inscription
   */
  static async createPendingApproval(userId, groupeId, companyId = null) {
    try {
      logInfo('Creating pending approval', {
        userId,
        groupeId,
        companyId
      });

      const pendingApproval = await PendingApproval.create({
        user_id: userId,
        groupe_id: groupeId,
        company_id: companyId,
        status: 'pending'
      });

      logInfo('Pending approval created', {
        approvalId: pendingApproval.id,
        userId,
        groupeId
      });

      return pendingApproval;
    } catch (error) {
      logError('Error creating pending approval', { userId, groupeId, error: error.message });
      throw error;
    }
  }

  /**
   * Récupérer approbations en attente pour un groupe
   */
  static async getPendingApprovalsForGroup(groupeId, filters = {}) {
    try {
      const whereClause = {
        groupe_id: groupeId,
        status: 'pending'
      };

      // Filtres additionnels
      if (filters.status) {
        whereClause.status = filters.status;
      }

      const pendingApprovals = await PendingApproval.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'prenom', 'nom']
          },
          {
            model: GroupeEntreprise,
            as: 'groupe',
            attributes: ['id', 'nom']
          },
          {
            model: User,
            as: 'approvedByUser',
            attributes: ['id', 'username', 'email'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });

      return pendingApprovals;
    } catch (error) {
      logError('Error fetching pending approvals', { groupeId, error: error.message });
      throw error;
    }
  }

  /**
   * Approuver une inscription
   */
  static async approveApproval(approvalId, approvedByUserId) {
    try {
      const approval = await PendingApproval.findByPk(approvalId);

      if (!approval) {
        throw new Error('Approbation non trouvée');
      }

      // Mettre à jour statut
      approval.status = 'approved';
      approval.approved_by = approvedByUserId;
      approval.approved_at = new Date();
      await approval.save();

      logSecurity('Approval granted', {
        approvalId,
        userId: approval.user_id,
        groupeId: approval.groupe_id,
        approvedBy: approvedByUserId
      });

      return approval;
    } catch (error) {
      logError('Error approving', { approvalId, error: error.message });
      throw error;
    }
  }

  /**
   * Rejeter une inscription
   */
  static async rejectApproval(approvalId, approvedByUserId, rejectionReason) {
    try {
      const approval = await PendingApproval.findByPk(approvalId);

      if (!approval) {
        throw new Error('Approbation non trouvée');
      }

      // Mettre à jour statut
      approval.status = 'rejected';
      approval.approved_by = approvedByUserId;
      approval.approved_at = new Date();
      approval.rejection_reason = rejectionReason;
      await approval.save();

      logSecurity('Approval rejected', {
        approvalId,
        userId: approval.user_id,
        groupeId: approval.groupe_id,
        rejectedBy: approvedByUserId,
        reason: rejectionReason
      });

      return approval;
    } catch (error) {
      logError('Error rejecting approval', { approvalId, error: error.message });
      throw error;
    }
  }

  /**
   * Compter les approbations en attente pour un groupe
   */
  static async countPendingForGroup(groupeId) {
    try {
      const count = await PendingApproval.count({
        where: {
          groupe_id: groupeId,
          status: 'pending'
        }
      });
      return count;
    } catch (error) {
      logError('Error counting pending approvals', { groupeId, error: error.message });
      throw error;
    }
  }

  /**
   * Récupérer statistiques approbations pour un groupe
   */
  static async getApprovalStats(groupeId) {
    try {
      const total = await PendingApproval.count({
        where: { groupe_id: groupeId }
      });

      const pending = await PendingApproval.count({
        where: { groupe_id: groupeId, status: 'pending' }
      });

      const approved = await PendingApproval.count({
        where: { groupe_id: groupeId, status: 'approved' }
      });

      const rejected = await PendingApproval.count({
        where: { groupe_id: groupeId, status: 'rejected' }
      });

      return {
        total,
        pending,
        approved,
        rejected,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      logError('Error calculating approval stats', { groupeId, error: error.message });
      throw error;
    }
  }
}

module.exports = GroupApprovalService;
