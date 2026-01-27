// cascade/src/services/roleApprovalService.js
import { User, GroupeEntreprise, Company, PendingRoleApproval, RoleApprovalWorkflow } from '../models/index.js';
import { Op } from 'sequelize';
import EmailService from './EmailService.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';

/**
 * RoleApprovalService - Service de gestion des approbations hiérarchiques
 * Gère le workflow d'approbation des inscriptions selon la hiérarchie des rôles
 */
class RoleApprovalService {
  /**
   * Déterminer si un rôle nécessite une approbation
   * @param {string} role - Le rôle à vérifier
   * @returns {boolean} - true si approbation requise
   */
  static requiresApproval(role) {
    const rolesRequiringApproval = ['super_utilisateur', 'utilisateur', 'super_consultant', 'consultant'];
    return rolesRequiringApproval.includes(role);
  }

  /**
   * Déterminer le rôle de l'approbateur selon le rôle demandé
   * @param {string} requestedRole - Le rôle demandé
   * @returns {string|null} - Le rôle de l'approbateur
   */
  static getApproverRole(requestedRole) {
    const approverMapping = {
      'super_utilisateur': 'admin',
      'utilisateur': 'super_utilisateur',
      'super_consultant': 'super_utilisateur',
      'consultant': 'super_utilisateur'
    };
    
    return approverMapping[requestedRole] || null;
  }

  /**
   * Créer une demande d'approbation de rôle
   * @param {Object} userData - Données de l'utilisateur
   * @param {Object} additionalData - Données supplémentaires selon le rôle
   * @returns {Object} - Résultat de la création
   */
  static async createApprovalRequest(userData, additionalData = {}) {
    try {
      const { role, email, username, prenom, nom } = userData;
      
      // Vérifier si une approbation est requise
      if (!this.requiresApproval(role)) {
        return {
          success: true,
          requiresApproval: false,
          message: 'Aucune approbation requise pour ce rôle'
        };
      }

      // Vérifier si une demande existe déjà
      const existingRequest = await PendingRoleApproval.findOne({
        where: {
          email,
          role,
          status: 'pending'
        }
      });

      if (existingRequest) {
        return {
          success: false,
          error: 'APPROVAL_ALREADY_EXISTS',
          message: 'Une demande d\'approbation est déjà en cours pour ce rôle'
        };
      }

      // Déterminer l'approbateur requis
      const approverRole = this.getApproverRole(role);
      if (!approverRole) {
        return {
          success: false,
          error: 'NO_APPROVER_DEFINED',
          message: 'Aucun approbateur défini pour ce rôle'
        };
      }

      // Créer la demande d'approbation
      const approvalRequest = await PendingRoleApproval.create({
        email,
        username,
        prenom,
        nom,
        role,
        approver_role: approverRole,
        status: 'pending',
        request_data: {
          ...userData,
          ...additionalData,
          requested_at: new Date().toISOString()
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });

      // Notifier les approbateurs potentiels
      await this.notifyPotentialApprovers(approvalRequest);

      logInfo('Approval request created', {
        requestId: approvalRequest.id,
        email,
        role,
        approverRole
      });

      return {
        success: true,
        requiresApproval: true,
        requestId: approvalRequest.id,
        message: 'Demande d\'approbation créée avec succès'
      };

    } catch (error) {
      logError('Error creating approval request', { error: error.message, userData });
      return {
        success: false,
        error: 'APPROVAL_CREATION_FAILED',
        message: 'Erreur lors de la création de la demande d\'approbation'
      };
    }
  }

  /**
   * Notifier les approbateurs potentiels
   * @param {Object} approvalRequest - La demande d'approbation
   */
  static async notifyPotentialApprovers(approvalRequest) {
    try {
      const { approver_role, email, prenom, nom, role } = approvalRequest;
      
      // Trouver les approbateurs disponibles
      const approvers = await User.findAll({
        where: {
          role: approver_role,
          is_active: true
        },
        attributes: ['id', 'email', 'username', 'prenom', 'nom']
      });

      if (approvers.length === 0) {
        logWarn('No approvers found', { approver_role, requestId: approvalRequest.id });
        return;
      }

      // Envoyer les notifications
      for (const approver of approvers) {
        await EmailService.sendApprovalNotification(
          approver.id,
          approver.email,
          `${prenom} ${nom}`,
          role,
          email
        );
      }

      logInfo('Approvers notified', {
        requestId: approvalRequest.id,
        approverCount: approvers.length,
        approverRole
      });

    } catch (error) {
      logError('Error notifying approvers', { error: error.message, requestId: approvalRequest.id });
    }
  }

  /**
   * Approuver une demande de rôle
   * @param {number} approverId - ID de l'approbateur
   * @param {number} requestId - ID de la demande
   * @param {string} comments - Commentaires de l'approbation
   * @returns {Object} - Résultat de l'approbation
   */
  static async approveRoleRequest(approverId, requestId, comments = '') {
    try {
      // Vérifier que la demande existe et est en attente
      const approvalRequest = await PendingRoleApproval.findOne({
        where: {
          id: requestId,
          status: 'pending'
        }
      });

      if (!approvalRequest) {
        return {
          success: false,
          error: 'REQUEST_NOT_FOUND',
          message: 'Demande d\'approbation non trouvée ou déjà traitée'
        };
      }

      // Vérifier que l'approbateur a le bon rôle
      const approver = await User.findByPk(approverId);
      if (!approver || approver.role !== approvalRequest.approver_role) {
        return {
          success: false,
          error: 'UNAUTHORIZED_APPROVER',
          message: 'Vous n\'êtes pas autorisé à approuver cette demande'
        };
      }

      // Mettre à jour la demande
      await approvalRequest.update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date(),
        comments: comments
      });

      // Créer l'utilisateur final
      const user = await this.createApprovedUser(approvalRequest);

      // Envoyer la notification d'approbation
      await EmailService.sendApprovalNotification(
        user.id,
        approvalRequest.email,
        'Votre inscription a été approuvée',
        user.role,
        approver.username
      );

      logInfo('Role request approved', {
        requestId,
        approverId,
        user_id: user.id,
        role: user.role
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          prenom: user.prenom,
          nom: user.nom
        },
        message: 'Demande approuvée avec succès'
      };

    } catch (error) {
      logError('Error approving role request', { error: error.message, approverId, requestId });
      return {
        success: false,
        error: 'APPROVAL_FAILED',
        message: 'Erreur lors de l\'approbation de la demande'
      };
    }
  }

  /**
   * Rejeter une demande de rôle
   * @param {number} approverId - ID de l'approbateur
   * @param {number} requestId - ID de la demande
   * @param {string} rejectionReason - Raison du rejet
   * @returns {Object} - Résultat du rejet
   */
  static async rejectRoleRequest(approverId, requestId, rejectionReason) {
    try {
      // Vérifier que la demande existe et est en attente
      const approvalRequest = await PendingRoleApproval.findOne({
        where: {
          id: requestId,
          status: 'pending'
        }
      });

      if (!approvalRequest) {
        return {
          success: false,
          error: 'REQUEST_NOT_FOUND',
          message: 'Demande d\'approbation non trouvée ou déjà traitée'
        };
      }

      // Vérifier que l'approbateur a le bon rôle
      const approver = await User.findByPk(approverId);
      if (!approver || approver.role !== approvalRequest.approver_role) {
        return {
          success: false,
          error: 'UNAUTHORIZED_APPROVER',
          message: 'Vous n\'êtes pas autorisé à rejeter cette demande'
        };
      }

      // Mettre à jour la demande
      await approvalRequest.update({
        status: 'rejected',
        rejected_by: approverId,
        rejected_at: new Date(),
        rejection_reason: rejectionReason
      });

      // Envoyer la notification de rejet
      await EmailService.sendRejectionNotification(
        null, // Pas d'utilisateur ID
        approvalRequest.email,
        'Votre inscription a été rejetée',
        rejectionReason,
        approver.username
      );

      logInfo('Role request rejected', {
        requestId,
        approverId,
        rejectionReason
      });

      return {
        success: true,
        message: 'Demande rejetée avec succès'
      };

    } catch (error) {
      logError('Error rejecting role request', { error: error.message, approverId, requestId });
      return {
        success: false,
        error: 'REJECTION_FAILED',
        message: 'Erreur lors du rejet de la demande'
      };
    }
  }

  /**
   * Créer l'utilisateur après approbation
   * @param {Object} approvalRequest - La demande approuvée
   * @returns {Object} - L'utilisateur créé
   */
  static async createApprovedUser(approvalRequest) {
    try {
      const { request_data } = approvalRequest;
      const {
        email,
        username,
        password,
        prenom,
        nom,
        telephone,
        role,
        groupe_id,
        groupeName,
        compagnieName,
        compagnieSiret,
        specialites,
        tarifHoraire,
        experienceYears,
        siret,
        contractTypes,
        registrationType,
        firmType,
        firmName,
        firmSiret,
        firmDescription
      } = request_data;

      // Créer l'utilisateur
      const user = await User.create({
        email,
        username,
        password,
        prenom,
        nom,
        telephone,
        role,
        is_active: true
      });

      // Créations supplémentaires selon le rôle
      if (role === 'super_utilisateur' && groupeName) {
        // Créer le groupe
        const groupe = await GroupeEntreprise.create({
          nom: groupeName,
          description: request_data.groupeDescription,
          siret: request_data.groupeSiret,
          adresse: request_data.groupeAdresse,
          telephone: request_data.groupeTelephone,
          email: request_data.groupeEmail,
          website: request_data.groupeWebsite,
          created_by: user.id
        });

        // Associer l'utilisateur au groupe
        await user.update({ groupe_id: groupe.id });
      }

      if (role === 'utilisateur' && compagnieName) {
        // Créer la compagnie
        const compagnie = await Company.create({
          nom: compagnieName,
          siret: compagnieSiret,
          description: request_data.compagnieDescription,
          email: request_data.compagnieEmail,
          telephone: request_data.compagnieTelephone,
          adresse: request_data.compagnieAdresse,
          website: request_data.compagnieWebsite,
          groupe_id: groupe_id,
          created_by: user.id
        });

        // Associer l'utilisateur à la compagnie
        await user.update({ compagnieId: compagnie.id });
      }

      // Pour les consultants, les données spécifiques sont déjà dans le modèle User
      if (role === 'consultant' || role === 'super_consultant') {
        await user.update({
          specialites: specialites || [],
          tarif_horaire: tarifHoraire ? parseFloat(tarifHoraire) : null,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          siret: siret || null
        });
      }

      logInfo('User created after approval', {
        user_id: user.id,
        email: user.email,
        role: user.role
      });

      return user;

    } catch (error) {
      logError('Error creating approved user', { error: error.message, requestId: approvalRequest.id });
      throw error;
    }
  }

  /**
   * Obtenir les demandes en attente pour un approbateur
   * @param {number} approverId - ID de l'approbateur
   * @returns {Array} - Liste des demandes en attente
   */
  static async getPendingRequests(approverId) {
    try {
      const approver = await User.findByPk(approverId);
      if (!approver) {
        return [];
      }

      const requests = await PendingRoleApproval.findAll({
        where: {
          approver_role: approver.role,
          status: 'pending'
        },
        order: [['created_at', 'DESC']]
      });

      return requests.map(request => ({
        id: request.id,
        email: request.email,
        username: request.username,
        prenom: request.prenom,
        nom: request.nom,
        role: request.role,
        requested_at: request.created_at,
        expires_at: request.expires_at,
        request_data: request.request_data
      }));

    } catch (error) {
      logError('Error getting pending requests', { error: error.message, approverId });
      return [];
    }
  }

  /**
   * Obtenir les statistiques d'approbation pour un approbateur
   * @param {number} approverId - ID de l'approbateur
   * @returns {Object} - Statistiques
   */
  static async getApprovalStats(approverId) {
    try {
      const approver = await User.findByPk(approverId);
      if (!approver) {
        return null;
      }

      const stats = await PendingRoleApproval.findAll({
        where: {
          approver_role: approver.role
        },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "pending" THEN 1 END')), 'pending'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "approved" THEN 1 END')), 'approved'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = "rejected" THEN 1 END')), 'rejected']
        ],
        raw: true
      });

      const result = stats[0];
      const total = parseInt(result.total) || 0;
      const approved = parseInt(result.approved) || 0;
      
      return {
        total,
        pending: parseInt(result.pending) || 0,
        approved,
        rejected: parseInt(result.rejected) || 0,
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
      };

    } catch (error) {
      logError('Error getting approval stats', { error: error.message, approverId });
      return null;
    }
  }

  /**
   * Nettoyer les demandes expirées
   * @returns {number} - Nombre de demandes nettoyées
   */
  static async cleanupExpiredRequests() {
    try {
      const deletedCount = await PendingRoleApproval.destroy({
        where: {
          status: 'pending',
          expires_at: {
            [Op.lt]: new Date()
          }
        }
      });

      if (deletedCount > 0) {
        logInfo('Expired requests cleaned up', { count: deletedCount });
      }

      return deletedCount;

    } catch (error) {
      logError('Error cleaning up expired requests', { error: error.message });
      return 0;
    }
  }
}

export default RoleApprovalService;
