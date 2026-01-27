/**
 * Réponse de succès standard
 * @param {Object} res - L'objet réponse Express
 * @param {*} data - Les données à renvoyer
 * @param {number} [statusCode=200] - Le code de statut HTTP
 * @param {string} [message='Opération réussie'] - Un message décrivant le succès
 */
const success = (res, data, statusCode = 200, message = 'Opération réussie') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Réponse d'erreur standard
 * @param {Object} res - L'objet réponse Express
 * @param {string} message - Le message d'erreur
 * @param {number} statusCode - Le code de statut HTTP
 * @param {Object} [errors=null] - Détails supplémentaires sur les erreurs
 */
const error = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Réponse 404 - Ressource non trouvée
 * @param {Object} res - L'objet réponse Express
 * @param {string} [message='Ressource non trouvée'] - Message personnalisé
 */
const notFound = (res, message = 'Ressource non trouvée') => {
  error(res, message, 404);
};

/**
 * Réponse 401 - Non autorisé
 * @param {Object} res - L'objet réponse Express
 * @param {string} [message='Authentification requise'] - Message personnalisé
 */
const unauthorized = (res, message = 'Authentification requise') => {
  error(res, message, 401);
};

/**
 * Réponse 403 - Accès refusé
 * @param {Object} res - L'objet réponse Express
 * @param {string} [message='Accès refusé'] - Message personnalisé
 */
const forbidden = (res, message = 'Accès refusé') => {
  error(res, message, 403);
};

/**
 * Réponse 400 - Mauvaise requête
 * @param {Object} res - L'objet réponse Express
 * @param {string} [message='Requête invalide'] - Message personnalisé
 * @param {Object} [errors=null] - Détails sur les erreurs de validation
 */
const badRequest = (res, message = 'Requête invalide', errors = null) => {
  error(res, message, 400, errors);
};

module.exports = {
  success,
  error,
  notFound,
  unauthorized,
  forbidden,
  badRequest
};
