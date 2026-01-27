/**
 * ApprovalProcessingService
 * Gère le traitement complet des approbations de rôles
 * Inclut: création utilisateur, escalade rôle, notifications
 */

import bcrypt from 'bcryptjs';
import { User, PendingRoleApproval } from '../models/index.js';
import { logInfo, logError } from '../utils/logger.js';

class ApprovalProcessingService {
  /**
   * Approuver une demande de rôle et créer/mettre à jour l'utilisateur
   * @param {number} approvalId - ID de la demande d'approbation
   * @param {number} approverId - ID de l'utilisateur qui approuve
   * @param {string} notes - Notes d'approbation
   * @returns {Object} - Résultat du traitement
   */
  static async approveRoleRequest(approvalId, approverId, notes = '') {
    try {
      // Récupérer la demande d'approbation
      const approval = await PendingRoleApproval.findByPk(approvalId);
      
      if (!approval) {
        return {
          success: false,
          error: 'APPROVAL_NOT_FOUND',
          message: 'Demande d\'approbation non trouvée'
        };
      }

      if (approval.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: `Impossible d'approuver une demande avec le statut: ${approval.status}`
        };
      }

      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ where: { email: approval.email } });

      const requestData = approval.request_data || {};
      
      if (!user) {
        // Créer le nouvel utilisateur avec le rôle approuvé
        const hashedPassword = await bcrypt.hash(
          requestData.password || 'TempPassword123!',
          10
        );

        user = await User.create({
          email: approval.email,
          username: approval.username || approval.email.split('@')[0],
          password: hashedPassword,
          prenom: approval.prenom,
          nom: approval.nom,
          telephone: approval.telephone,
          role: approval.role, // Utiliser le rôle approuvé
          isActive: true,
          // Champs consultant si fournis
          ...(requestData.specialites && { specialites: requestData.specialites }),
          ...(requestData.tarifHoraire && { tarif_horaire: requestData.tarifHoraire }),
          ...(requestData.experienceYears && { experience_years: requestData.experienceYears }),
          ...(requestData.siret && { siret: requestData.siret }),
          hierarchy_level: this.getHierarchyLevel(approval.role),
          can_grant_permissions: this.canGrantPermissions(approval.role)
        });

        logInfo('User created from approval', {
          userId: user.id,
          email: approval.email,
          role: approval.role
        });
      } else {
        // Mettre à jour le rôle de l'utilisateur existant
        const oldRole = user.role;
        await user.update({
          role: approval.role,
          isActive: true,
          hierarchy_level: this.getHierarchyLevel(approval.role),
          can_grant_permissions: this.canGrantPermissions(approval.role),
          // Mettre à jour les champs consultant si fournis
          ...(requestData.specialites && { specialites: requestData.specialites }),
          ...(requestData.tarifHoraire && { tarif_horaire: requestData.tarifHoraire }),
          ...(requestData.experienceYears && { experience_years: requestData.experienceYears }),
          ...(requestData.siret && { siret: requestData.siret })
        });

        logInfo('User role escalated', {
          userId: user.id,
          email: approval.email,
          oldRole,
          newRole: approval.role
        });
      }

      // Mettre à jour le statut de l'approbation
      await approval.update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date(),
        approval_notes: notes
      });

      logInfo('Role approval processed successfully', {
        approvalId,
        userId: user.id,
        role: approval.role,
        approverId
      });

      return {
        success: true,
        userId: user.id,
        email: user.email,
        role: approval.role,
        message: 'Approbation traitée et utilisateur créé/mis à jour avec succès'
      };

    } catch (error) {
      logError('Error approving role request', { 
        approvalId, 
        error: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        error: 'APPROVAL_PROCESSING_FAILED',
        message: 'Erreur lors du traitement de l\'approbation'
      };
    }
  }

  /**
   * Rejeter une demande de rôle
   * @param {number} approvalId - ID de la demande d'approbation
   * @param {number} rejecterId - ID de l'utilisateur qui rejette
   * @param {string} reason - Raison du rejet
   * @returns {Object} - Résultat du rejet
   */
  static async rejectRoleRequest(approvalId, rejecterId, reason = '') {
    try {
      const approval = await PendingRoleApproval.findByPk(approvalId);
      
      if (!approval) {
        return {
          success: false,
          error: 'APPROVAL_NOT_FOUND',
          message: 'Demande d\'approbation non trouvée'
        };
      }

      if (approval.status !== 'pending') {
        return {
          success: false,
          error: 'INVALID_STATUS',
          message: `Impossible de rejeter une demande avec le statut: ${approval.status}`
        };
      }

      // Mettre à jour le statut
      await approval.update({
        status: 'rejected',
        rejected_by: rejecterId,
        rejected_at: new Date(),
        rejection_reason: reason
      });

      logInfo('Role request rejected', {
        approvalId,
        email: approval.email,
        role: approval.role,
        rejecterId,
        reason
      });

      return {
        success: true,
        message: 'Demande rejetée avec succès'
      };

    } catch (error) {
      logError('Error rejecting role request', { approvalId, error: error.message });
      return {
        success: false,
        error: 'REJECTION_FAILED',
        message: 'Erreur lors du rejet de la demande'
      };
    }
  }

  /**
   * Déterminer le niveau hiérarchique selon le rôle
   * @param {string} role - Le rôle
   * @returns {number} - Niveau hiérarchique
   */
  static getHierarchyLevel(role) {
    const hierarchyMap = {
      'admin': 1,
      'super_utilisateur': 2,
      'utilisateur': 3,
      'super_consultant': 3,
      'consultant': 4,
      'accountant': 4,
      'viewer': 5
    };
    return hierarchyMap[role] || 5;
  }

  /**
   * Déterminer si un rôle peut accorder des permissions
   * @param {string} role - Le rôle
   * @returns {boolean} - true si peut accorder des permissions
   */
  static canGrantPermissions(role) {
    const grantingRoles = ['admin', 'super_utilisateur', 'super_consultant'];
    return grantingRoles.includes(role);
  }
}

export default ApprovalProcessingService;
