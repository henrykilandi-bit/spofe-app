const { validationResult } = require('express-validator');
const response = require('../utils/response');

/**
 * Middleware pour valider les données de requête avec express-validator
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Formater les erreurs
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));

    return response.error(res, 'Erreur de validation', 400, formattedErrors);
  };
};

/**
 * Middleware pour gérer les erreurs asynchrones
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware pour gérer les routes non trouvées
 */
exports.notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
};

/**
 * Middleware pour gérer les erreurs globales
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err.stack);

  // Erreur de validation
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Session expirée. Veuillez vous reconnecter.'
    });
  }

  // Erreur serveur par défaut
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};
