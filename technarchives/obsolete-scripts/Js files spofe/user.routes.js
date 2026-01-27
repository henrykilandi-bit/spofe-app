const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validate } = require('../middlewares/validate');
const { authValidation } = require('../utils/validators');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes protégées par authentification
router.use(authenticate);

// Récupérer tous les utilisateurs (admin uniquement)
router.get(
  '/',
  authorize('admin'),
  userController.getAllUsers
);

// Récupérer un utilisateur par ID
router.get(
  '/:id',
  authValidation.params,
  validate,
  userController.getUserById
);

// Mettre à jour un utilisateur
router.put(
  '/:id',
  authValidation.params,
  authValidation.updateProfile,
  validate,
  userController.updateUser
);

// Supprimer un utilisateur (admin uniquement)
router.delete(
  '/:id',
  authorize('admin'),
  authValidation.params,
  validate,
  userController.deleteUser
);

// Changer le mot de passe
router.post(
  '/change-password',
  authValidation.changePassword,
  validate,
  userController.changePassword
);

module.exports = router;
