const { User } = require('../models');
const { success, error, notFound, forbidden } = require('../utils/response');

/**
 * Récupérer tous les utilisateurs (admin uniquement)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['mot_de_passe'] },
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });
    success(res, users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    error(res, 'Une erreur est survenue lors de la récupération des utilisateurs', 500);
  }
};

/**
 * Récupérer un utilisateur par son ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return notFound(res, 'Utilisateur non trouvé');
    }

    success(res, user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    error(res, 'Une erreur est survenue lors de la récupération de l\'utilisateur', 500);
  }
};

/**
 * Mettre à jour un utilisateur
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, actif } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return notFound(res, 'Utilisateur non trouvé');
    }

    // Vérifier les autorisations
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return forbidden(res, 'Vous n\'êtes pas autorisé à modifier cet utilisateur');
    }

    // Mise à jour des champs
    const updates = {};
    if (nom) updates.nom = nom;
    if (prenom) updates.prenom = prenom;
    if (email && email !== user.email) updates.email = email;
    
    // Seul un admin peut changer le rôle ou le statut actif
    if (req.user.role === 'admin') {
      if (role !== undefined) updates.role = role;
      if (actif !== undefined) updates.actif = actif;
    }

    await user.update(updates);

    // Récupérer l'utilisateur mis à jour (sans le mot de passe)
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['mot_de_passe'] }
    });

    success(res, updatedUser, 200, 'Utilisateur mis à jour avec succès');
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    error(res, 'Une erreur est survenue lors de la mise à jour de l\'utilisateur', 500);
  }
};

/**
 * Supprimer un utilisateur (admin uniquement)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher l'auto-suppression
    if (req.user.id === parseInt(id)) {
      return error(res, 'Vous ne pouvez pas supprimer votre propre compte', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return notFound(res, 'Utilisateur non trouvé');
    }

    await user.destroy();
    success(res, null, 200, 'Utilisateur supprimé avec succès');
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    error(res, 'Une erreur est survenue lors de la suppression de l\'utilisateur', 500);
  }
};

/**
 * Changer le mot de passe
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.scope('withPassword').findByPk(req.user.id);
    
    if (!user) {
      return notFound(res, 'Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return error(res, 'Le mot de passe actuel est incorrect', 400);
    }

    // Mettre à jour le mot de passe
    user.mot_de_passe = newPassword;
    await user.save();

    success(res, null, 200, 'Mot de passe mis à jour avec succès');
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe:', err);
    error(res, 'Une erreur est survenue lors du changement de mot de passe', 500);
  }
};
