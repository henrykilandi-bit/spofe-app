import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Hook personnalisé pour gérer l'inscription des utilisateurs
 * Inclut validation temps réel, vérifications et gestion d'état
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  /**
   * Calculer la force du mot de passe
   */
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
    return strength;
  }, []);

  /**
   * Vérifier la disponibilité d'un email
   */
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || email.length < 5 || !email.includes('@')) {
      setEmailAvailable(null);
      return null;
    }

    setEmailChecking(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`,
        { timeout: 5000 }
      );
      
      const available = response.data.available;
      setEmailAvailable(available);
      return available;
    } catch (error) {
      console.error('Erreur vérification email:', error);
      setEmailAvailable(null);
      return null;
    } finally {
      setEmailChecking(false);
    }
  }, []);

  /**
   * Vérifier la disponibilité d'un nom d'utilisateur
   */
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return null;
    }

    setUsernameChecking(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/check-username/${encodeURIComponent(username)}`,
        { timeout: 5000 }
      );
      
      const available = response.data.available;
      setUsernameAvailable(available);
      return available;
    } catch (error) {
      console.error('Erreur vérification username:', error);
      setUsernameAvailable(null);
      return null;
    } finally {
      setUsernameChecking(false);
    }
  }, []);

  /**
   * Valider le formulaire d'inscription
   */
  const validateForm = useCallback((formData) => {
    const errors = {};

    // Validation email
    if (!formData.email) {
      errors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Validation username
    if (!formData.username) {
      errors.username = 'Nom d\'utilisateur requis';
    } else if (formData.username.length < 3) {
      errors.username = 'Minimum 3 caractères';
    } else if (formData.username.length > 30) {
      errors.username = 'Maximum 30 caractères';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Lettres, chiffres et underscore uniquement';
    }

    // Validation mot de passe
    if (!formData.password) {
      errors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Minimum 8 caractères';
    } else if (calculatePasswordStrength(formData.password) < 50) {
      errors.password = 'Mot de passe trop faible';
    }

    // Validation confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation requise';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation prénom et nom
    if (!formData.prenom?.trim()) {
      errors.prenom = 'Prénom requis';
    }
    if (!formData.nom?.trim()) {
      errors.nom = 'Nom requis';
    }

    // Validation téléphone
    if (formData.telephone && !/^[0-9+\-\s()]{10,15}$/.test(formData.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }

    return errors;
  }, [calculatePasswordStrength]);

  /**
   * Inscrire un nouvel utilisateur
   */
  const register = useCallback(async (formData) => {
    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      // Validation côté client
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return {
          success: false,
          errors: validationErrors,
          message: 'Veuillez corriger les erreurs dans le formulaire'
        };
      }

      // Vérifications disponibilité
      const [emailAvailable, usernameAvailable] = await Promise.all([
        checkEmailAvailability(formData.email),
        checkUsernameAvailability(formData.username)
      ]);

      if (emailAvailable === false) {
        setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
        return {
          success: false,
          message: 'Cet email est déjà utilisé'
        };
      }

      if (usernameAvailable === false) {
        setErrors(prev => ({ ...prev, username: 'Ce nom d\'utilisateur est déjà pris' }));
        return {
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        };
      }

      // Appel API
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          prenom: formData.prenom,
          nom: formData.nom,
          telephone: formData.telephone || null,
          groupe_id: formData.groupe_id || null,
          invitationToken: formData.invitationToken || null
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      setUserData(response.data.user);
      setSuccess(true);

      return {
        success: true,
        data: response.data,
        message: response.data.message,
        requiresApproval: response.data.requiresApproval
      };

    } catch (error) {
      console.error('Erreur inscription:', error);

      let errorMessage = 'Erreur lors de l\'inscription';
      let errorDetails = {};

      if (error.response) {
        // Erreurs serveur
        if (error.response.data.errors) {
          errorDetails = error.response.data.errors;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }

      setErrors(errorDetails);

      return {
        success: false,
        errors: errorDetails,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [checkEmailAvailability, checkUsernameAvailability, validateForm]);

  /**
   * Valider une invitation
   */
  const validateInvitation = useCallback(async (token, email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/validate-invitation`,
        {
          params: { token, email },
          timeout: 5000
        }
      );
      
      return {
        valid: response.data.valid,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur validation invitation:', error);
      return {
        valid: false,
        message: error.response?.data?.message || 'Invitation invalide'
      };
    }
  }, []);

  /**
   * Récupérer les informations d'un groupe
   */
  const fetchGroupeInfo = useCallback(async (groupe_id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/groupes/${groupe_id}`,
        { timeout: 5000 }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur récupération groupe:', error);
      return {
        success: false,
        message: 'Impossible de charger les informations du groupe'
      };
    }
  }, []);

  /**
   * Réinitialiser les états
   */
  const reset = useCallback(() => {
    setLoading(false);
    setEmailChecking(false);
    setUsernameChecking(false);
    setEmailAvailable(null);
    setUsernameAvailable(null);
    setErrors({});
    setSuccess(false);
    setUserData(null);
    setPasswordStrength(0);
  }, []);

  return {
    // États
    loading,
    emailChecking,
    usernameChecking,
    emailAvailable,
    usernameAvailable,
    errors,
    success,
    userData,
    passwordStrength,
    
    // Méthodes
    register,
    validateForm,
    checkEmailAvailability,
    checkUsernameAvailability,
    calculatePasswordStrength,
    validateInvitation,
    fetchGroupeInfo,
    reset,
    
    // Utilitaires
    setErrors
  };
};

export default useRegister;
