/**
 * Middleware: isGroupSuperUser
 * Vérifie que l'utilisateur est super user du groupe spécifié
 * Empêche un super user d'accéder à d'autres groupes
 */

const { GroupeSuperUser, GroupeEntreprise } = require('../models');
const { logSecurity } = require('../utils/logger');

/**
 * Middleware pour vérifier si utilisateur est super user du groupe
 */
const isGroupSuperUser = async (req, res, next) => {
  try {
    // Récupérer groupe ID depuis URL ou body
    const groupeId = req.params.groupeId || req.body.groupeId;
    
    if (!groupeId) {
      logSecurity('Permission denied: No groupeId provided', {
        userId: req.user.id,
        action: 'isGroupSuperUser',
        reason: 'missing_groupe_id'
      });
      return res.status(400).json({
        success: false,
        message: 'Groupe ID manquant',
        code: 'MISSING_GROUPE_ID'
      });
    }

    // Vérifier que l'utilisateur est super user de ce groupe
    const superUserAssignment = await GroupeSuperUser.findOne({
      where: {
        groupe_id: groupeId,
        user_id: req.user.id
      }
    });

    if (!superUserAssignment) {
      logSecurity('Permission denied: User is not super user of group', {
        userId: req.user.id,
        groupeId,
        action: req.method + ' ' + req.path
      });
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas super utilisateur de ce groupe',
        code: 'NOT_GROUP_SUPER_USER'
      });
    }

    // Attacher groupe ID et super user info au request
    req.groupeId = parseInt(groupeId);
    req.isSuperUserOfGroup = true;
    
    logSecurity('Permission granted: User is super user of group', {
      userId: req.user.id,
      groupeId,
      action: req.method + ' ' + req.path
    });

    next();
  } catch (error) {
    console.error('❌ Erreur middleware isGroupSuperUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur vérification permissions',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier si utilisateur est admin central ou super user du groupe
 */
const isGroupAdminOrSuperUser = async (req, res, next) => {
  try {
    // Admin central (super_admin) a toujours accès
    if (req.user.role === 'super_admin') {
      req.isAdminOrSuperUser = true;
      return next();
    }

    // Sinon, vérifier si super user du groupe
    const groupeId = req.params.groupeId || req.body.groupeId;
    
    if (!groupeId) {
      return res.status(400).json({
        success: false,
        message: 'Groupe ID manquant'
      });
    }

    const superUserAssignment = await GroupeSuperUser.findOne({
      where: {
        groupe_id: groupeId,
        user_id: req.user.id
      }
    });

    if (!superUserAssignment) {
      logSecurity('Permission denied: Not admin or super user', {
        userId: req.user.id,
        groupeId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
        code: 'INSUFFICIENT_PERMISSION'
      });
    }

    req.groupeId = parseInt(groupeId);
    req.isAdminOrSuperUser = true;
    next();
  } catch (error) {
    console.error('❌ Erreur middleware isGroupAdminOrSuperUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur vérification permissions'
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est admin central
 */
const isCentralAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    logSecurity('Permission denied: Not central admin', {
      userId: req.user.id,
      userRole: req.user.role,
      action: req.method + ' ' + req.path
    });
    return res.status(403).json({
      success: false,
      message: 'Vous devez être administrateur central',
      code: 'NOT_CENTRAL_ADMIN'
    });
  }
  next();
};

module.exports = {
  isGroupSuperUser,
  isGroupAdminOrSuperUser,
  isCentralAdmin
};
