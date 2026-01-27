/**
 * Auth Routes - Registration
 * Endpoints d'inscription utilisateurs
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const UserInvitationService = require('../services/UserInvitationService');
const GroupApprovalService = require('../services/GroupApprovalService');
const { auth } = require('../middleware/auth.middleware');
const { success, error: errorResponse } = require('../utils/response');
const { logInfo, logError, logSecurity } = require('../utils/logger');
const featureFlags = require('../config/featureFlags');

// Schéma validation inscription
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  prenom: Joi.string().required(),
  nom: Joi.string().required(),
  groupeId: Joi.number().optional() // Groupe si inscription via lien d'invitation
});

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res, next) => {
  try {
    // Valider données
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 'Données invalides', 400, [error.details[0].message]);
    }

    // Valider avec service
    const validationErrors = UserInvitationService.validateRegistrationData(value);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Inscription invalide', 400, validationErrors);
    }

    // Enregistrer utilisateur
    const newUser = await UserInvitationService.registerUser(value);

    // Vérifier feature flag pour workflow d'approbation
    const requiresApproval = featureFlags.isFeatureEnabled('superUserGroupApproval');

    logSecurity('User registration', {
      userId: newUser.id,
      email: value.email,
      groupeId: value.groupeId,
      requiresApproval
    });

    success(res, {
      user: newUser,
      requiresApproval,
      message: requiresApproval
        ? 'Inscription réussie. En attente d\'approbation d\'un administrateur.'
        : 'Inscription réussie. Vous pouvez maintenant vous connecter.'
    }, 201, 'Inscription complète');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/accept-invitation
 * Accepter une invitation par email
 */
router.post('/accept-invitation', async (req, res, next) => {
  try {
    const { email, token, password, prenom, nom } = req.body;

    if (!email || !token || !password || !prenom || !nom) {
      return errorResponse(res, 'Paramètres manquants', 400, ['email, token, password, prenom et nom requis']);
    }

    // Accepter l'invitation
    const result = await UserInvitationService.acceptInvitation(
      email,
      token,
      password,
      prenom,
      nom
    );

    logSecurity('Invitation accepted', {
      userId: result.userId,
      email
    });

    success(res, result, 200, 'Invitation acceptée');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/registration-status/:email
 * Vérifier statut d'inscription d'un utilisateur
 */
router.get('/registration-status/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const { User, PendingApproval } = require('../models');

    // Chercher utilisateur
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return success(res, {
        exists: false,
        status: 'not_registered',
        message: 'Utilisateur non enregistré'
      }, 200);
    }

    // Chercher approbations en attente
    const pendingApprovals = await PendingApproval.findAll({
      where: {
        user_id: user.id,
        status: 'pending'
      }
    });

    const status = {
      exists: true,
      userId: user.id,
      isActive: user.isActive,
      role: user.role,
      status: user.role === 'user' ? 'active' : user.role === 'user_invited' ? 'invited' : 'pending_approval',
      pendingGroupApprovals: pendingApprovals.length,
      message: buildStatusMessage(user, pendingApprovals.length)
    };

    success(res, status, 200, 'Statut d\'inscription');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/check-email/:email
 * Vérifier disponibilité d'une adresse email
 */
router.get('/check-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const { User } = require('../models');

    const existingUser = await User.findOne({ where: { email } });

    success(res, {
      available: !existingUser,
      email,
      message: existingUser ? 'Email déjà utilisé' : 'Email disponible'
    }, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/invite-user (Admin/SuperUser)
 * Inviter un utilisateur
 */
router.post('/invite-user', auth, async (req, res, next) => {
  try {
    const { email, groupeId } = req.body;
    const userId = req.user.id;

    if (!email || !groupeId) {
      return errorResponse(res, 'email et groupeId requis', 400);
    }

    // Vérifier que l'utilisateur courant peut inviter (super-admin ou super-user du groupe)
    const { GroupeSuperUser, GroupeEntreprise } = require('../models');

    const isAdmin = req.user.role === 'super_admin';
    const groupe = await GroupeEntreprise.findByPk(groupeId);

    if (!groupe) {
      return errorResponse(res, 'Groupe non trouvé', 404);
    }

    if (!isAdmin) {
      const isSuperUser = await GroupeSuperUser.findOne({
        where: { user_id: userId, groupe_id: groupeId }
      });

      if (!isSuperUser) {
        return errorResponse(res, 'Vous n\'avez pas permission d\'inviter des utilisateurs dans ce groupe', 403);
      }
    }

    // Inviter utilisateur
    const invitationResult = await UserInvitationService.inviteUserByEmail(
      email,
      groupeId,
      userId
    );

    logSecurity('User invited', {
      email,
      groupeId,
      invitedBy: userId
    });

    success(res, invitationResult, 201, invitationResult.message);
  } catch (err) {
    next(err);
  }
});

// Fonction helper pour construire message de statut
function buildStatusMessage(user, pendingApprovalsCount) {
  if (user.role === 'user') {
    return 'Utilisateur actif';
  }
  if (user.role === 'user_invited') {
    return 'Invitation en attente d\'acceptation';
  }
  if (pendingApprovalsCount > 0) {
    return `Inscription en attente d'approbation (${pendingApprovalsCount} groupe(s))`;
  }
  return 'Statut inconnu';
}

module.exports = router;
