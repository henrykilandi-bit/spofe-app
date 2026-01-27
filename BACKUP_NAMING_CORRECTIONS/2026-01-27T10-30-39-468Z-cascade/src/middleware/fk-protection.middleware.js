/**
 * 🛡️ FK PROTECTION MIDDLEWARE v2.1
 * ================================
 *
 * Middleware pour intercepter et sécuriser les suppressions
 * Vérifie les contraintes FK avant d'exécuter une suppression
 * Prevents accidental data loss
 */

import { isCriticalFK } from '../config/foreign-key-policy.js';
import SafeDeletionService from '../services/safe-deletion.service.js';
import { logSecurity, logError, logWarn } from '../utils/logger.js';

/**
 * Middleware de protection FK
 *
 * À utiliser sur les routes de suppression
 * Exemple: router.delete('/:id', fkProtectionMiddleware, deleteHandler);
 */
export const fkProtectionMiddleware = async (req, res, next) => {
  try {
    // Vérifier s'il y a un corps de demande DELETE
    if (req.method !== 'DELETE' && req.method !== 'POST') {
      return next();
    }

    // Vérifier s'il y a un identifiant à supprimer
    const entityId = req.params.id || req.body?.id;
    if (!entityId) {
      return next();
    }

    // Vérifier si l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required for deletion',
      });
    }

    // Vérifier la raison de suppression pour entités critiques
    const modelName = req.model?.name || req.params.model;

    if (modelName && isCriticalFK(modelName, 'id')) {
      if (!req.body?.deletionReason || req.body.deletionReason.trim().length === 0) {
        logWarn('DELETION_WITHOUT_REASON', {
          model: modelName,
          id: entityId,
          user: req.user.id,
        });

        return res.status(400).json({
          error: 'Deletion reason required',
          message: `Suppression d'une entité critique (${modelName}) exige une raison documentée`,
          code: 'DELETION_REASON_REQUIRED',
        });
      }
    }

    // Passer au prochain middleware
    next();
  } catch (error) {
    logError('FK_PROTECTION_MIDDLEWARE_ERROR', {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Server error',
      message: 'Erreur lors du check de sécurité FK',
    });
  }
};

/**
 * Middleware pour check d'impact avant suppression
 *
 * Affiche un rapport d'impact avant de procéder
 * Utilisateur doit confirmer en envoyant: { confirmed: true }
 */
export const checkImpactBeforeDeletion = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { confirmed } = req.body;

    if (!entityType || !entityId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'entityType and entityId sont requis',
      });
    }

    // 1. Check l'impact
    const impact = await SafeDeletionService.checkDeletionImpact(entityType, entityId);

    // 2. S'il y a des erreurs, refuser
    if (!impact.canDelete) {
      logSecurity('DELETION_IMPOSSIBLE', {
        entityType,
        entityId,
        user: req.user?.id,
        errors: impact.errors,
      });

      return res.status(409).json({
        error: 'Cannot delete',
        code: 'DELETION_IMPOSSIBLE',
        message: impact.errors[0],
        impact: {
          canDelete: false,
          checks: impact.checks,
          errors: impact.errors,
        },
      });
    }

    // 3. S'il y a des warnings et pas de confirmation, afficher et demander confirmation
    if (impact.warnings.length > 0 && !confirmed) {
      logWarn('DELETION_REQUIRES_CONFIRMATION', {
        entityType,
        entityId,
        user: req.user?.id,
        warnings: impact.warnings,
      });

      return res.status(202).json({
        code: 'DELETION_REQUIRES_CONFIRMATION',
        message: 'La suppression a des conséquences - confirmation requise',
        impact: {
          canDelete: true,
          checks: impact.checks,
          warnings: impact.warnings,
          affectedRecords: impact.affectedRecords,
        },
        nextStep: 'Renvoyer avec { confirmed: true } pour procéder',
      });
    }

    // 4. Tout est OK, passer à la suppression
    req.deletionImpact = impact;
    next();
  } catch (error) {
    logError('CHECK_IMPACT_MIDDLEWARE_ERROR', {
      error: error.message,
    });

    return res.status(500).json({
      error: 'Server error',
      message: "Erreur lors du check d'impact",
    });
  }
};

/**
 * Middleware pour audit de suppression
 *
 * Enregistre tous les détails de la suppression
 */
export const auditDeletionMiddleware = async (req, res, next) => {
  try {
    // Intercepter la réponse pour l'auditer
    const originalSend = res.send;

    res.send = function (data) {
      // Si suppression réussie (status 200-204)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logSecurity('DELETION_AUDIT', {
          entityType: req.params.entityType || req.model?.name,
          entityId: req.params.id || req.body?.id,
          user: req.user?.id,
          reason: req.body?.deletionReason,
          timestamp: new Date(),
          ip: req.ip,
        });
      }

      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    logError('AUDIT_DELETION_MIDDLEWARE_ERROR', {
      error: error.message,
    });
    next(); // Continuer même si erreur d'audit
  }
};

/**
 * Middleware pour vérifier les permissions de suppression
 *
 * Seulement admin peut supprimer les données critiques
 */
export const deletionAuthorizationMiddleware = async (req, res, next) => {
  try {
    const { entityType } = req.params;

    // Vérifier si c'est une entité critique
    if (entityType && ['groupe_entreprise', 'compagnie', 'user'].includes(entityType)) {
      // Vérifier que l'utilisateur est admin
      if (!req.user || req.user.role !== 'admin') {
        logSecurity('DELETION_UNAUTHORIZED', {
          entityType,
          user: req.user?.id,
          role: req.user?.role,
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Seuls les administrateurs peuvent supprimer les données critiques',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }
    }

    next();
  } catch (error) {
    logError('DELETION_AUTHORIZATION_MIDDLEWARE_ERROR', {
      error: error.message,
    });

    return res.status(500).json({
      error: 'Server error',
    });
  }
};

/**
 * Middleware pour rate limiting sur suppressions
 *
 * Prévient les suppressions massives accidentelles
 */
export const deletionRateLimitMiddleware = (() => {
  const deletionAttempts = new Map();

  return (maxAttemptsPerMinute = 10) => {
    return (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return next();
        }

        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Récupérer les tentatives de cet utilisateur
        if (!deletionAttempts.has(userId)) {
          deletionAttempts.set(userId, []);
        }

        const attempts = deletionAttempts.get(userId);

        // Nettoyer les tentatives old
        const recentAttempts = attempts.filter((timestamp) => timestamp > oneMinuteAgo);
        deletionAttempts.set(userId, recentAttempts);

        // Vérifier limit
        if (recentAttempts.length >= maxAttemptsPerMinute) {
          logSecurity('DELETION_RATE_LIMIT_EXCEEDED', {
            user: userId,
            attempts: recentAttempts.length,
            limit: maxAttemptsPerMinute,
          });

          return res.status(429).json({
            error: 'Too many deletion attempts',
            message: `Limite de ${maxAttemptsPerMinute} suppressions par minute atteinte`,
            code: 'DELETION_RATE_LIMIT_EXCEEDED',
            retryAfter: 60,
          });
        }

        // Ajouter cette tentative
        recentAttempts.push(now);
        deletionAttempts.set(userId, recentAttempts);

        next();
      } catch (error) {
        logError('DELETION_RATE_LIMIT_MIDDLEWARE_ERROR', {
          error: error.message,
        });
        next(); // Continuer même si erreur
      }
    };
  };
})();

/**
 * Middleware composé: Toutes les protections
 */
export const allDeletionProtections = [
  fkProtectionMiddleware,
  deletionAuthorizationMiddleware,
  deletionRateLimitMiddleware(10),
  auditDeletionMiddleware,
];

export default fkProtectionMiddleware;
