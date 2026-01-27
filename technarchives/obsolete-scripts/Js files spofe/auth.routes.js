const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate');
const { authValidation } = require('../utils/validators');
const { authenticate } = require('../middlewares/auth');

// Route d'inscription
router.post(
  '/register',
  authValidation.register,
  validate,
  authController.register
);

// Route de connexion
router.post(
  '/login',
  authValidation.login,
  validate,
  authController.login
);

// Route pour récupérer le profil utilisateur
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

module.exports = router;
