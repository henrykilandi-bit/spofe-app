/**
 * Groupe Super User Routes
 * Endpoints pour gérer les super utilisateurs de groupe et les approbations
 */

const express = require('express');
const router = express.Router();
const {
  isGroupSuperUser,
  isGroupAdminOrSuperUser,
  isCentralAdmin
} = require('../middleware/groupPermissions.middleware');
const { auth } = require('../middleware/auth.middleware');
const GroupApprovalService = require('../services/GroupApprovalService');
const UserInvitationService = require('../services/UserInvitationService');
const emailService = require('../services/EmailService');
const { success, error: errorResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');

// Récupérer les approbations en attente pour un groupe
router.get(
  '/groups/:groupeId/pending-approvals',
  auth,
  isGroupAdminOrSuperUser(),
  async (req, res, next) => {
    try {
      const { groupeId } = req.params;
      const { status, limit, offset } = req.query;

      const approvals = await GroupApprovalService.getPendingApprovalsForGroup(
        groupeId,
        { status, limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 }
      );

      const count = await GroupApprovalService.countPendingForGroup(groupeId);

      success(res, {
        approvals,
        pagination: {
          total: count,
          limit: parseInt(limit) || 50,
          offset: parseInt(offset) || 0
        }
      }, 200, 'Approbations récupérées');
    } catch (err) {
      next(err);
    }
  }
);

// Approuver une inscription
router.post(
  '/pending-approvals/:approvalId/approve',
  auth,
  async (req, res, next) => {
    try {
      const { approvalId } = req.params;
      const userId = req.user.id;

      // Vérifier que l'utilisateur courant est super-user du groupe
      const approval = await PendingApproval.findByPk(approvalId, {
        include: [{ model: GroupeEntreprise, as: 'groupe' }]
      });

      if (!approval) {
        return errorResponse(res, 'Approbation non trouvée', 404);
      }

      // Vérifier permissions
      const isSuperUser = await isGroupSuperUserCheck(userId, approval.groupe_id);
      const isAdmin = req.user.role === 'super_admin';

      if (!isSuperUser && !isAdmin) {
        return errorResponse(res, 'Accès refusé', 403);
      }

      // Approuver
      const updatedApproval = await GroupApprovalService.approveApproval(approvalId, userId);

      // Envoyer email de notification
      const approvedUser = await User.findByPk(approval.user_id);
      if (approvedUser) {
        await emailService.sendApprovalNotification(
          approvedUser.id,
          approvedUser.email,
          approval.groupe.nom,
          req.user.username
        );
      }

      success(res, updatedApproval, 200, 'Inscription approuvée');
    } catch (err) {
      next(err);
    }
  }
);

// Rejeter une inscription
router.post(
  '/pending-approvals/:approvalId/reject',
  auth,
  async (req, res, next) => {
    try {
      const { approvalId } = req.params;
      const { rejectionReason } = req.body;
      const userId = req.user.id;

      if (!rejectionReason) {
        return errorResponse(res, 'Raison du rejet requise', 400);
      }

      const approval = await PendingApproval.findByPk(approvalId, {
        include: [{ model: GroupeEntreprise, as: 'groupe' }]
      });

      if (!approval) {
        return errorResponse(res, 'Approbation non trouvée', 404);
      }

      // Vérifier permissions
      const isSuperUser = await isGroupSuperUserCheck(userId, approval.groupe_id);
      const isAdmin = req.user.role === 'super_admin';

      if (!isSuperUser && !isAdmin) {
        return errorResponse(res, 'Accès refusé', 403);
      }

      // Rejeter
      const updatedApproval = await GroupApprovalService.rejectApproval(
        approvalId,
        userId,
        rejectionReason
      );

      // Envoyer email de notification
      const rejectedUser = await User.findByPk(approval.user_id);
      if (rejectedUser) {
        await emailService.sendRejectionNotification(
          rejectedUser.id,
          rejectedUser.email,
          approval.groupe.nom,
          rejectionReason,
          req.user.username
        );
      }

      success(res, updatedApproval, 200, 'Inscription rejetée');
    } catch (err) {
      next(err);
    }
  }
);

// Récupérer statistiques approbations pour un groupe
router.get(
  '/groups/:groupeId/approval-stats',
  auth,
  isGroupAdminOrSuperUser(),
  async (req, res, next) => {
    try {
      const { groupeId } = req.params;

      const stats = await GroupApprovalService.getApprovalStats(groupeId);

      success(res, stats, 200, 'Statistiques approbations');
    } catch (err) {
      next(err);
    }
  }
);

// Assigner super-utilisateur à un groupe
router.post(
  '/groups/:groupeId/super-users',
  auth,
  isCentralAdmin(),
  async (req, res, next) => {
    try {
      const { groupeId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return errorResponse(res, 'userId requis', 400);
      }

      // Vérifier que le groupe existe
      const groupe = await GroupeEntreprise.findByPk(groupeId);
      if (!groupe) {
        return errorResponse(res, 'Groupe non trouvé', 404);
      }

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return errorResponse(res, 'Utilisateur non trouvé', 404);
      }

      // Créer assignation
      const superUserAssignment = await GroupeSuperUser.create({
        groupe_id: groupeId,
        user_id: userId,
        assigned_by: req.user.id
      });

      logInfo('Super user assigned to group', {
        groupeId,
        userId,
        assignedBy: req.user.id
      });

      success(res, superUserAssignment, 201, 'Super-utilisateur assigné');
    } catch (err) {
      next(err);
    }
  }
);

// Lister super-utilisateurs d'un groupe
router.get(
  '/groups/:groupeId/super-users',
  auth,
  isGroupAdminOrSuperUser(),
  async (req, res, next) => {
    try {
      const { groupeId } = req.params;

      const superUsers = await GroupeSuperUser.findAll({
        where: { groupe_id: groupeId },
        include: [
          { model: User, as: 'superUser', attributes: ['id', 'username', 'email', 'prenom', 'nom'] }
        ]
      });

      success(res, superUsers, 200, 'Super-utilisateurs du groupe');
    } catch (err) {
      next(err);
    }
  }
);

// Supprimer super-utilisateur d'un groupe
router.delete(
  '/groups/:groupeId/super-users/:userId',
  auth,
  isCentralAdmin(),
  async (req, res, next) => {
    try {
      const { groupeId, userId } = req.params;

      const deleted = await GroupeSuperUser.destroy({
        where: {
          groupe_id: groupeId,
          user_id: userId
        }
      });

      if (!deleted) {
        return errorResponse(res, 'Super-utilisateur non trouvé', 404);
      }

      logInfo('Super user removed from group', {
        groupeId,
        userId,
        removedBy: req.user.id
      });

      success(res, { groupeId, userId }, 200, 'Super-utilisateur supprimé');
    } catch (err) {
      next(err);
    }
  }
);

// Fonction helper pour vérifier si super-user
async function isGroupSuperUserCheck(userId, groupeId) {
  const { GroupeSuperUser } = require('../models');
  const assignment = await GroupeSuperUser.findOne({
    where: { user_id: userId, groupe_id: groupeId }
  });
  return !!assignment;
}

module.exports = router;
