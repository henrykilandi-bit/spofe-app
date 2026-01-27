/**
 * Middleware: Autorisation pour Business Operations
 *
 * Adapté aux rôles SPOFE existants:
 * - admin: Comptable / Admin financier (validation)
 * - accountant: Comptable (validation)
 * - user: Non-comptable (saisie uniquement)
 * - viewer: Lecture seule (consultation)
 *
 * Règles métier SPOFE:
 * - USER: Peut créer, modifier (DRAFT uniquement), soumettre
 * - ADMIN/ACCOUNTANT: Peut valider, rejeter, tout consulter
 * - VIEWER: Lecture seule sur opérations validées
 */

import logger from '../utils/logger.js';
import { BusinessOperation } from '../models/index.js';

/**
 * Vérifie si l'utilisateur peut créer une opération
 */
export const canCreateBusinessOperation = (req, res, next) => {
  const allowedRoles = ['admin', 'accountant', 'user'];

  if (!allowedRoles.includes(req.user.role)) {
    logger.logSecurity({
      action: 'BUSINESS_OPERATION_CREATE_DENIED',
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: "Vous n'avez pas les permissions pour créer une opération",
    });
  }

  next();
};

/**
 * Vérifie si l'utilisateur peut modifier une opération
 *
 * Règles:
 * - USER: Peut modifier ses propres DRAFT
 * - ADMIN/ACCOUNTANT: Peut modifier toutes les opérations (sauf VALIDATED)
 * - VIEWER: Aucune modification
 */
export const canEditBusinessOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operation = await BusinessOperation.findByPk(id);

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée',
      });
    }

    // RÈGLE CRITIQUE: Aucune modification d'opération validée
    if (operation.status === 'VALIDATED') {
      logger.logSecurity({
        action: 'BUSINESS_OPERATION_EDIT_VALIDATED_DENIED',
        userId: req.user.id,
        operationId: id,
        ip: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: 'Modification interdite: opération validée. Utilisez une contre-passation.',
      });
    }

    // ADMIN/ACCOUNTANT peuvent tout modifier (sauf VALIDATED)
    if (['admin', 'accountant'].includes(req.user.role)) {
      req.businessOperation = operation;
      return next();
    }

    // USER peut modifier ses propres DRAFT
    if (req.user.role === 'user') {
      if (operation.createdBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez modifier que vos propres opérations',
        });
      }

      if (operation.status !== 'DRAFT') {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez modifier que les opérations en brouillon',
        });
      }

      req.businessOperation = operation;
      return next();
    }

    // VIEWER ne peut rien modifier
    return res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes',
    });
  } catch (error) {
    logger.logError('Erreur vérification permissions édition', {
      error: error.message,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
    });
  }
};

/**
 * Vérifie si l'utilisateur peut valider une opération
 *
 * Réservé aux ADMIN et ACCOUNTANT uniquement
 */
export const canValidateBusinessOperation = async (req, res, next) => {
  if (!['admin', 'accountant'].includes(req.user.role)) {
    logger.logSecurity({
      action: 'BUSINESS_OPERATION_VALIDATE_DENIED',
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: 'Seuls les comptables peuvent valider les opérations',
    });
  }

  try {
    const { id } = req.params;
    const operation = await BusinessOperation.findByPk(id);

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée',
      });
    }

    if (operation.status !== 'PENDING_VALIDATION') {
      return res.status(400).json({
        success: false,
        message: `Impossible de valider: statut actuel "${operation.status}"`,
      });
    }

    req.businessOperation = operation;
    next();
  } catch (error) {
    logger.logError('Erreur vérification permissions validation', {
      error: error.message,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
    });
  }
};

/**
 * Vérifie si l'utilisateur peut rejeter une opération
 *
 * Réservé aux ADMIN et ACCOUNTANT uniquement
 */
export const canRejectBusinessOperation = async (req, res, next) => {
  if (!['admin', 'accountant'].includes(req.user.role)) {
    logger.logSecurity({
      action: 'BUSINESS_OPERATION_REJECT_DENIED',
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: 'Seuls les comptables peuvent rejeter les opérations',
    });
  }

  try {
    const { id } = req.params;
    const operation = await BusinessOperation.findByPk(id);

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée',
      });
    }

    if (operation.status !== 'PENDING_VALIDATION') {
      return res.status(400).json({
        success: false,
        message: `Impossible de rejeter: statut actuel "${operation.status}"`,
      });
    }

    req.businessOperation = operation;
    next();
  } catch (error) {
    logger.logError('Erreur vérification permissions rejet', {
      error: error.message,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
    });
  }
};

/**
 * Vérifie si l'utilisateur peut consulter les opérations
 *
 * Règles:
 * - ADMIN/ACCOUNTANT: Tout consulter
 * - USER: Ses propres opérations
 * - VIEWER: Opérations validées uniquement
 */
export const canViewBusinessOperations = (req, res, next) => {
  const allowedRoles = ['admin', 'accountant', 'user', 'viewer'];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes',
    });
  }

  // Stocker le rôle pour filtrage dans le controller
  req.viewScope = req.user.role;
  next();
};

/**
 * Vérifie si l'utilisateur peut gérer les templates
 *
 * Réservé aux ADMIN et ACCOUNTANT uniquement
 */
export const canManageTemplates = (req, res, next) => {
  if (!['admin', 'accountant'].includes(req.user.role)) {
    logger.logSecurity({
      action: 'TEMPLATE_MANAGE_DENIED',
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });

    return res.status(403).json({
      success: false,
      message: "Seuls les comptables peuvent gérer les templates d'opérations",
    });
  }

  next();
};

/**
 * Vérifie si l'utilisateur peut supprimer une opération
 *
 * Règles:
 * - USER: Peut supprimer ses propres DRAFT
 * - ADMIN: Peut supprimer DRAFT et REJECTED (jamais VALIDATED)
 * - Soft delete uniquement
 */
export const canDeleteBusinessOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operation = await BusinessOperation.findByPk(id);

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée',
      });
    }

    // RÈGLE CRITIQUE: Aucune suppression d'opération validée
    if (operation.status === 'VALIDATED') {
      logger.logSecurity({
        action: 'BUSINESS_OPERATION_DELETE_VALIDATED_DENIED',
        userId: req.user.id,
        operationId: id,
        ip: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: 'Suppression interdite: opération validée. Utilisez une contre-passation.',
      });
    }

    // ADMIN peut supprimer DRAFT et REJECTED
    if (req.user.role === 'admin') {
      if (!['DRAFT', 'REJECTED'].includes(operation.status)) {
        return res.status(403).json({
          success: false,
          message: 'Seules les opérations en brouillon ou rejetées peuvent être supprimées',
        });
      }
      req.businessOperation = operation;
      return next();
    }

    // USER peut supprimer ses propres DRAFT
    if (req.user.role === 'user') {
      if (operation.createdBy !== req.user.id || operation.status !== 'DRAFT') {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez supprimer que vos propres opérations en brouillon',
        });
      }
      req.businessOperation = operation;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Permissions insuffisantes',
    });
  } catch (error) {
    logger.logError('Erreur vérification permissions suppression', {
      error: error.message,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
    });
  }
};
