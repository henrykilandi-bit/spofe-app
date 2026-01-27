// src/middleware/error.middleware.js
import logger from '../utils/logger.js';

// Classe d'erreur applicative personnalisée
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Wrapper pour gérer les erreurs des routes asynchrones
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Gestion des erreurs 404
export const notFound = (req, res, next) => {
  const error = new AppError(`Non trouvé - ${req.originalUrl}`, 404);
  next(error);
};

// Gestionnaire d'erreurs global (DOIT être en dernier)
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Erreur serveur interne';
  let errors = err.errors || null;

  // 🛡️ GÉRER LES ERREURS CSRF
  if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    message = 'Token de sécurité invalide ou expiré';

    // Log de sécurité CRITIQUE
    logger.warn("🚨 CSRF_TOKEN_INVALID - TENTATIVE POTENTIELLE D'ATTAQUE", {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      potentialAttack: true,
    });

    // Réponse adaptée pour requêtes API
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        error: 'CSRF_TOKEN_INVALID',
        message: 'Token de sécurité invalide ou expiré. Veuillez rafraîchir.',
        code: 'SECURITY_VIOLATION',
        retryUrl: '/api/csrf-token',
        timestamp: new Date().toISOString(),
      });
    }

    // Pour requêtes HTML, afficher page d'erreur
    return res.status(403).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erreur de Sécurité</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 50px; color: #333; }
                    .error-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px; }
                    h1 { color: #dc3545; }
                    .retry-btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="error-box">
                    <h1>🔒 Erreur de Sécurité</h1>
                    <p>Votre token de sécurité a expiré ou est invalide.</p>
                    <p><strong>Action requise:</strong> Veuillez rafraîchir la page et réessayer.</p>
                    <p>
                        <a href="/" class="retry-btn">Retour à l'accueil</a>
                    </p>
                </div>
            </body>
            </html>
        `);
  }

  // Gérer les erreurs Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Erreur de validation';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'La valeur fournie existe déjà';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide ou expiré';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Paramètre invalide: ${err.path}`;
  }

  // Journalisation de l'erreur
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](message, {
    status: statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Réponse d'erreur standardisée
  const errorResponse = {
    success: false,
    message: message,
    statusCode: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(errors && { errors }),
  };

  res.status(statusCode).json(errorResponse);
};
