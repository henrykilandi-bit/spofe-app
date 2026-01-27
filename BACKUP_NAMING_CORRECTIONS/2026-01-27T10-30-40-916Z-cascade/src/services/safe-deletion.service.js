/**
 * 🛡️ SAFE DELETION SERVICE v2.1
 * =============================
 * 
 * Service de suppression sécurisée et contrôlée
 * Prévention contre les suppressions accidentelles
 * Audit complet de toute suppression
 */

import { Op } from 'sequelize';
import { logSecurity, logError, logInfo } from '../utils/logger.js';
import { isCriticalFK } from '../config/foreign-key-policy.js';

/**
 * Erreurs métier spécifiques
 */
class DeletionError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'DeletionError';
  }
}

class BusinessError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'BusinessError';
  }
}

class SafeDeletionService {
  
  /**
   * 📋 VÉRIFIER L'IMPACT AVANT SUPPRESSION
   */
  async checkDeletionImpact(entityType, entityId) {
    const impactReport = {
      entityType,
      entityId,
      timestamp: new Date(),
      checks: [],
      canDelete: true,
      warnings: [],
      errors: [],
      affectedRecords: {}
    };
    
    try {
      switch (entityType.toLowerCase()) {
        
        case 'groupe_entreprise':
        case 'groupes_entreprises':
          await this._checkGroupeEntrepriseImpact(entityId, impactReport);
          break;
          
        case 'compagnie':
        case 'compagnies':
          await this._checkCompagnieImpact(entityId, impactReport);
          break;
          
        case 'user':
        case 'users':
          await this._checkUserImpact(entityId, impactReport);
          break;
          
        case 'chart_of_accounts':
        case 'charts_of_accounts':
          await this._checkChartImpact(entityId, impactReport);
          break;
          
        default:
          impactReport.warnings.push(`Type d'entité non analysé: ${entityType}`);
      }
      
      // Déterminer si suppression possible
      impactReport.canDelete = impactReport.errors.length === 0;
      
    } catch (error) {
      impactReport.errors.push(`Erreur lors du check: ${error.message}`);
      impactReport.canDelete = false;
    }
    
    return impactReport;
  }
  
  /**
   * 🏢 Analyser impact suppression groupe
   */
  async _checkGroupeEntrepriseImpact(groupeId, report) {
    try {
      // Compagnies actives
      const compagniesActives = await sequelize.models.Compagnie.count({
        where: {
          groupe_id: groupeId,
          deleted_at: null,
          statut: 'actif'
        }
      });
      
      report.checks.push({
        check: 'compagnies_actives',
        count: compagniesActives,
        severity: compagniesActives > 0 ? 'ERROR' : 'OK'
      });
      
      if (compagniesActives > 0) {
        report.errors.push(
          `Le groupe contient ${compagniesActives} compagnie(s) active(s) - Suppression impossible`
        );
        report.affectedRecords.compagniesActives = compagniesActives;
        return;
      }
      
      // Compagnies supprimées logiquement
      const compagniesSupprimees = await sequelize.models.Compagnie.count({
        where: {
          groupe_id: groupeId,
          deleted_at: { [Op.not]: null }
        },
        paranoid: false
      });
      
      report.checks.push({
        check: 'compagnies_supprimees',
        count: compagniesSupprimees,
        severity: 'WARNING'
      });
      
      if (compagniesSupprimees > 0) {
        report.warnings.push(
          `${compagniesSupprimees} compagnie(s) déjà supprimée(s) - Seront archivées`
        );
        report.affectedRecords.compagniesSupprimees = compagniesSupprimees;
      }
      
    } catch (error) {
      report.errors.push(`Erreur check groupe: ${error.message}`);
    }
  }
  
  /**
   * 🏭 Analyser impact suppression compagnie
   */
  async _checkCompagnieImpact(compagnieId, report) {
    try {
      // Écritures comptables actives (posées ou validées)
      const ecrituresActives = await sequelize.models.JournalEntry.count({
        where: {
          compagnie_id: compagnieId,
          deleted_at: null,
          status: { [Op.in]: ['posted', 'approved', 'confirmed'] }
        }
      });
      
      report.checks.push({
        check: 'journal_entries_posted',
        count: ecrituresActives,
        severity: ecrituresActives > 0 ? 'ERROR' : 'OK'
      });
      
      if (ecrituresActives > 0) {
        report.errors.push(
          `La compagnie a ${ecrituresActives} écriture(s) comptable(s) - Suppression impossible`
        );
        report.affectedRecords.ecrituresActives = ecrituresActives;
        return;
      }
      
      // Toutes les écritures (même brouillons)
      const toutesEcritures = await sequelize.models.JournalEntry.count({
        where: {
          compagnie_id: compagnieId,
          deleted_at: null
        }
      });
      
      report.checks.push({
        check: 'journal_entries_total',
        count: toutesEcritures,
        severity: 'WARNING'
      });
      
      if (toutesEcritures > 0) {
        report.warnings.push(
          `${toutesEcritures} écriture(s) en brouillon - Seront supprimées logiquement`
        );
        report.affectedRecords.ecrituresTotal = toutesEcritures;
      }
      
      // Plan comptable
      const planComptable = await sequelize.models.ChartOfAccount.count({
        where: {
          compagnie_id: compagnieId,
          deleted_at: null
        }
      });
      
      report.checks.push({
        check: 'chart_of_accounts',
        count: planComptable,
        severity: 'WARNING'
      });
      
      if (planComptable > 0) {
        report.warnings.push(
          `${planComptable} compte(s) comptable(s) - Seront archivés avant suppression`
        );
        report.affectedRecords.planComptable = planComptable;
      }
      
      // Utilisateurs actifs
      const utilisateurs = await sequelize.models.User.count({
        where: {
          compagnie_id: compagnieId,
          deleted_at: null,
          is_active: true
        }
      });
      
      report.checks.push({
        check: 'active_users',
        count: utilisateurs,
        severity: utilisateurs > 0 ? 'WARNING' : 'OK'
      });
      
      if (utilisateurs > 0) {
        report.warnings.push(
          `${utilisateurs} utilisateur(s) actif(s) - Seront désactivés`
        );
        report.affectedRecords.utilisateurs = utilisateurs;
      }
      
    } catch (error) {
      report.errors.push(`Erreur check compagnie: ${error.message}`);
    }
  }
  
  /**
   * 👤 Analyser impact suppression utilisateur
   */
  async _checkUserImpact(userId, report) {
    try {
      // Données d'authentification liées
      const twoFactors = await sequelize.models.TwoFactorAuth?.count?.({
        where: { user_id: userId }
      }) || 0;
      
      report.checks.push({
        check: 'two_factor_auths',
        count: twoFactors,
        severity: 'INFO'
      });
      
      // Tokens (expirés de toute façon)
      const tokens = await sequelize.models.PasswordResetToken?.count?.({
        where: { user_id: userId }
      }) || 0;
      
      report.checks.push({
        check: 'password_reset_tokens',
        count: tokens,
        severity: 'INFO'
      });
      
      report.warnings.push(
        `${twoFactors} 2FA et ${tokens} token(s) de réinitialisation seront supprimés`
      );
      
    } catch (error) {
      report.errors.push(`Erreur check utilisateur: ${error.message}`);
    }
  }
  
  /**
   * 📊 Analyser impact suppression plan comptable
   */
  async _checkChartImpact(chartId, report) {
    try {
      // Mouvements comptables (débits/crédits)
      const mouvements = await sequelize.models.JournalEntryLine?.count?.({
        where: { accountId: chartId }
      }) || 0;
      
      report.checks.push({
        check: 'journal_entry_lines',
        count: mouvements,
        severity: mouvements > 0 ? 'WARNING' : 'OK'
      });
      
      if (mouvements > 0) {
        report.warnings.push(
          `${mouvements} mouvement(s) comptable(s) utilise ce compte - Archive recommandée`
        );
      }
      
      // Soldes
      const soldes = await sequelize.models.AccountBalance?.count?.({
        where: { numero_compte_id: chartId }
      }) || 0;
      
      report.checks.push({
        check: 'account_balances',
        count: soldes,
        severity: soldes > 0 ? 'WARNING' : 'OK'
      });
      
    } catch (error) {
      report.errors.push(`Erreur check chart: ${error.message}`);
    }
  }
  
  /**
   * 🗑️ SUPPRIMER GROUPE D'ENTREPRISE
   */
  async deleteGroupeEntreprise(groupeId, userId, deletionReason = '') {
    const timestamp = new Date();
    
    logSecurity('DELETION_REQUEST', {
      entityType: 'groupe_entreprise',
      entityId: groupeId,
      userId,
      reason: deletionReason
    });
    
    // 1. Vérifier l'impact
    const impact = await this.checkDeletionImpact('groupe_entreprise', groupeId);
    
    if (!impact.canDelete) {
      logSecurity('DELETION_BLOCKED', {
        entityType: 'groupe_entreprise',
        entityId: groupeId,
        reason: impact.errors.join('; ')
      });
      
      throw new BusinessError(
        'CANNOT_DELETE_GROUPE',
        `Impossible de supprimer le groupe: ${impact.errors[0]}`,
        { impact }
      );
    }
    
    // 2. Transaction pour intégrité
    return await sequelize.transaction(async (transaction) => {
      try {
        
        // 3. Archiver compagnies supprimées
        if (impact.affectedRecords.compagniesSupprimees > 0) {
          await sequelize.models.Compagnie.update(
            {
              statut: 'archive',
              deletion_reason: `Groupe supprimé: ${deletionReason}`
            },
            {
              where: {
                groupe_id: groupeId,
                deleted_at: { [Op.not]: null }
              },
              paranoid: false,
              transaction
            }
          );
        }
        
        // 4. Soft delete du groupe
        await sequelize.models.GroupeEntreprise.update(
          {
            deleted_at: timestamp,
            deleted_by_user_id: userId,
            deletion_reason: deletionReason,
            statut: 'supprime'
          },
          {
            where: { id: groupeId },
            transaction
          }
        );
        
        // 5. Audit
        await sequelize.models.AuditTrail?.create?.({
          user_id: userId,
          action: 'DELETE_GROUPE_ENTREPRISE',
          details: {
            groupe_id: groupeId,
            compagniesSupprimees: impact.affectedRecords.compagniesSupprimees,
            reason: deletionReason
          },
          timestamp
        }, { transaction });
        
        logInfo('DELETION_SUCCESS', {
          entityType: 'groupe_entreprise',
          entityId: groupeId,
          userId,
          affectedRecords: impact.affectedRecords
        });
        
        return {
          success: true,
          entityType: 'groupe_entreprise',
          entityId: groupeId,
          deletedAt: timestamp,
          affectedRecords: impact.affectedRecords
        };
        
      } catch (error) {
        logError('DELETION_FAILED', {
          entityType: 'groupe_entreprise',
          entityId: groupeId,
          error: error.message
        });
        throw error;
      }
    });
  }
  
  /**
   * 🏭 SUPPRIMER COMPAGNIE
   */
  async deleteCompagnie(compagnieId, userId, deletionReason = '') {
    const timestamp = new Date();
    
    logSecurity('DELETION_REQUEST', {
      entityType: 'compagnie',
      entityId: compagnieId,
      userId,
      reason: deletionReason
    });
    
    // 1. Vérifier l'impact
    const impact = await this.checkDeletionImpact('compagnie', compagnieId);
    
    if (!impact.canDelete) {
      logSecurity('DELETION_BLOCKED', {
        entityType: 'compagnie',
        entityId: compagnieId,
        reason: impact.errors.join('; ')
      });
      
      throw new BusinessError(
        'CANNOT_DELETE_COMPAGNIE',
        `Impossible de supprimer la compagnie: ${impact.errors[0]}`,
        { impact }
      );
    }
    
    // 2. Transaction
    return await sequelize.transaction(async (transaction) => {
      try {
        
        // 3. Soft delete des écritures brouillons
        if (impact.affectedRecords.ecrituresTotal > 0) {
          await sequelize.models.JournalEntry.destroy({
            where: {
              compagnie_id: compagnieId,
              deleted_at: null
            },
            transaction
          });
        }
        
        // 4. Archiver le plan comptable
        if (impact.affectedRecords.planComptable > 0) {
          await sequelize.models.ChartOfAccount.update(
            {
              statut: 'archive',
              archived_at: timestamp
            },
            {
              where: {
                compagnie_id: compagnieId,
                deleted_at: null
              },
              transaction
            }
          );
        }
        
        // 5. Désactiver les utilisateurs
        if (impact.affectedRecords.utilisateurs > 0) {
          await sequelize.models.User.update(
            {
              is_active: false,
              disabled_reason: `Compagnie ${compagnieId} supprimée`
            },
            {
              where: {
                compagnie_id: compagnieId,
                deleted_at: null,
                is_active: true
              },
              transaction
            }
          );
        }
        
        // 6. Soft delete de la compagnie
        await sequelize.models.Compagnie.update(
          {
            deleted_at: timestamp,
            deleted_by_user_id: userId,
            deletion_reason: deletionReason,
            statut: 'supprime'
          },
          {
            where: { id: compagnieId },
            transaction
          }
        );
        
        // 7. Audit
        await sequelize.models.AuditTrail?.create?.({
          user_id: userId,
          action: 'DELETE_COMPAGNIE',
          details: {
            compagnie_id: compagnieId,
            affectedRecords: impact.affectedRecords,
            reason: deletionReason
          },
          timestamp
        }, { transaction });
        
        logInfo('DELETION_SUCCESS', {
          entityType: 'compagnie',
          entityId: compagnieId,
          userId,
          affectedRecords: impact.affectedRecords
        });
        
        return {
          success: true,
          entityType: 'compagnie',
          entityId: compagnieId,
          deletedAt: timestamp,
          affectedRecords: impact.affectedRecords
        };
        
      } catch (error) {
        logError('DELETION_FAILED', {
          entityType: 'compagnie',
          entityId: compagnieId,
          error: error.message
        });
        throw error;
      }
    });
  }
}

// Export singleton
export default new SafeDeletionService();
export { SafeDeletionService, DeletionError, BusinessError };
