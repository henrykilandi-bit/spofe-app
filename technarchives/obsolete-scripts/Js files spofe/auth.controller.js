const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/response');
const config = require('../config/config');

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return error(res, 'Cet email est déjà utilisé', 400);
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      mot_de_passe: password, // Le mot de passe sera hashé par le hook du modèle
      nom,
      prenom,
      role: 'user' // Par défaut, les nouveaux utilisateurs ont le rôle 'user'
    });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Réponse
    success(res, {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      token
    }, 201, 'Inscription réussie');

  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    error(res, 'Une erreur est survenue lors de l\'inscription', 500);
  }
};

/**
 * Connexion d'un utilisateur
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return error(res, 'Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Email ou mot de passe incorrect', 401);
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return error(res, 'Ce compte a été désactivé', 403);
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ derniere_connexion: new Date() });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Réponse
    success(res, {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      token
    });

  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    error(res, 'Une erreur est survenue lors de la connexion', 500);
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
exports.getProfile = async (req, res) => {
  try {
    // L'utilisateur est disponible dans req.user grâce au middleware d'authentification
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return error(res, 'Utilisateur non trouvé', 404);
    }

    success(res, user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    error(res, 'Une erreur est survenue lors de la récupération du profil', 500);
  }
};
