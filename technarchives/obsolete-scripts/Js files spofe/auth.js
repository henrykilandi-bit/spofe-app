const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { unauthorized, forbidden } = require('../utils/response');
const config = require('../config/config');

/**
 * Middleware pour vérifier l'authentification via JWT
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Authentification requise. Aucun token fourni.');
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return unauthorized(res, 'Token invalide - Utilisateur non trouvé');
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return forbidden(res, 'Ce compte a été désactivé');
    }

    // Ajouter l'utilisateur à l'objet de requête
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Session expirée. Veuillez vous reconnecter.');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Token invalide');
    }
    console.error('Erreur d\'authentification:', err);
    return unauthorized(res, 'Échec de l\'authentification');
  }
};

/**
 * Middleware pour vérifier les rôles autorisés
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return forbidden(res, 'Accès refusé. Droits insuffisants.');
    }
    next();
  };
};
