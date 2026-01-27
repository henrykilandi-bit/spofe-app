const { body, param } = require('express-validator');

/**
 * Règles de validation pour l'authentification
 */
exports.authValidation = {
  // Validation de l'inscription
  register: [
    body('email')
      .trim()
      .isEmail().withMessage('Veuillez fournir une adresse email valide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
      .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom est requis')
      .isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
    body('prenom')
      .trim()
      .notEmpty().withMessage('Le prénom est requis')
      .isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères')
  ],

  // Validation de la connexion
  login: [
    body('email')
      .trim()
      .isEmail().withMessage('Veuillez fournir une adresse email valide')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis')
  ],

  // Validation du changement de mot de passe
  changePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
      .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
        }
        return true;
      })
  ],

  // Validation de la mise à jour du profil
  updateProfile: [
    body('email')
      .optional()
      .isEmail().withMessage('Veuillez fournir une adresse email valide')
      .normalizeEmail(),
    body('nom')
      .optional()
      .trim()
      .notEmpty().withMessage('Le nom ne peut pas être vide')
      .isLength({ max: 50 }).withMessage('Le nom ne doit pas dépasser 50 caractères'),
    body('prenom')
      .optional()
      .trim()
      .notEmpty().withMessage('Le prénom ne peut pas être vide')
      .isLength({ max: 50 }).withMessage('Le prénom ne doit pas dépasser 50 caractères')
  ],

  // Validation des paramètres d'URL
  params: [
    param('id')
      .isInt().withMessage('L\'ID doit être un nombre entier')
      .toInt()
  ]
};

/**
 * Fonction utilitaire pour valider les rôles
 */
exports.validateRole = (role) => {
  const roles = Array.isArray(role) ? role : [role];
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits insuffisants.'
      });
    }
    next();
  };
};
