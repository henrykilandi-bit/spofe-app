/**
 * UserInvitationService
 * Gère les invitations et inscriptions d'utilisateurs
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, PendingApproval, GroupeEntreprise } = require('../models');
const { logInfo, logError, logSecurity } = require('../utils/logger');
const emailService = require('./EmailService');

class UserInvitationService {
  /**
   * Enregistrer un nouvel utilisateur (self-registration)
   */
  static async registerUser(userData) {
    try {
      const {
        email,
        username,
        password,
        prenom,
        nom,
        groupeId
      } = userData;

      // Vérifier si utilisateur existe
      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Hasher mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer utilisateur
      const newUser = await User.create({
        email,
        username,
        password: hashedPassword,
        prenom,
        nom,
        role: 'user',
        isActive: true
      });

      logInfo('New user registered', {
        userId: newUser.id,
        email,
        groupeId
      });

      // Si groupe spécifié, créer approbation
      if (groupeId) {
        await PendingApproval.create({
          user_id: newUser.id,
          groupe_id: groupeId,
          status: 'pending'
        });

        logSecurity('User registration submitted for approval', {
          userId: newUser.id,
          groupeId
        });
      }

      return {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        message: 'Inscription réussie. En attente d\'approbation.' // À adapter si auto-approval
      };
    } catch (error) {
      logError('Error registering user', { email: userData.email, error: error.message });
      throw error;
    }
  }

  /**
   * Inviter un utilisateur par email
   */
  static async inviteUserByEmail(email, groupeId, invitedByUserId) {
    try {
      // Générer token d'invitation
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      // Vérifier si utilisateur existe
      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        // Utilisateur existe, créer approbation directement
        const approval = await PendingApproval.create({
          user_id: existingUser.id,
          groupe_id: groupeId,
          status: 'pending'
        });

        logInfo('Existing user added to approval queue', {
          userId: existingUser.id,
          groupeId
        });

        return {
          existingUser: true,
          userId: existingUser.id,
          message: 'Utilisateur existant ajouté à la file d\'attente'
        };
      }

      // Utilisateur n'existe pas, créer invitation
      const invitation = await User.create({
        email,
        username: email.split('@')[0] + '_' + crypto.randomBytes(4).toString('hex'),
        password: crypto.randomBytes(16).toString('hex'),
        invitationToken,
        invitationTokenExpiry: tokenExpiry,
        role: 'user_invited',
        isActive: false
      });

      // Envoyer email d'invitation
      try {
        await emailService.sendInvitationEmail(email, invitationToken);
      } catch (emailError) {
        logError('Failed to send invitation email', { email, error: emailError.message });
      }

      logSecurity('User invited', {
        email,
        groupeId,
        invitedBy: invitedByUserId
      });

      return {
        existingUser: false,
        userId: invitation.id,
        message: 'Invitation envoyée à ' + email
      };
    } catch (error) {
      logError('Error inviting user', { email, groupeId, error: error.message });
      throw error;
    }
  }

  /**
   * Accepter une invitation et définir mot de passe
   */
  static async acceptInvitation(email, token, password, prenom, nom) {
    try {
      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier token
      if (user.invitationToken !== token || !user.invitationTokenExpiry || user.invitationTokenExpiry < new Date()) {
        throw new Error('Token d\'invitation invalide ou expiré');
      }

      // Mettre à jour utilisateur
      user.password = await bcrypt.hash(password, 10);
      user.prenom = prenom;
      user.nom = nom;
      user.role = 'user';
      user.isActive = true;
      user.invitationToken = null;
      user.invitationTokenExpiry = null;
      await user.save();

      logSecurity('Invitation accepted', {
        userId: user.id,
        email
      });

      return {
        userId: user.id,
        message: 'Bienvenue! Votre compte est maintenant actif.'
      };
    } catch (error) {
      logError('Error accepting invitation', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Valider données d'inscription
   */
  static validateRegistrationData(data) {
    const errors = [];

    if (!data.email || !data.email.includes('@')) {
      errors.push('Email invalide');
    }

    if (!data.username || data.username.length < 3) {
      errors.push('Nom d\'utilisateur minimum 3 caractères');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('Mot de passe minimum 8 caractères');
    }

    if (!data.prenom || !data.nom) {
      errors.push('Prénom et nom requis');
    }

    return errors;
  }
}

module.exports = UserInvitationService;
