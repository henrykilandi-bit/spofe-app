// frontend/src/pages/RegisterPage-Extended.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import './RegisterPage.css';
import '../components/registration/RegistrationForms.css';
import { useNotifications } from '../hooks/useNotifications';

// Import des composants d'inscription
import RoleSelector from '../components/registration/RoleSelector';
import SuperUtilisateurForm from '../components/registration/SuperUtilisateurForm';
import UtilisateurForm from '../components/registration/UtilisateurForm';
import ConsultantForm from '../components/registration/ConsultantForm';

/**
 * RegisterPageExtended - Page d'inscription multi-groupes pour SPOFE v2.1
 * Features: Formulaire conditionnel par rôle, workflow approbation hiérarchique
 */
const RegisterPageExtended = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  
  // Récupération des paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const invitedEmail = queryParams.get('email') || '';
  const groupe_id = queryParams.get('groupe_id') ? parseInt(queryParams.get('groupe_id')) : null;
  const invitationToken = queryParams.get('token') || '';

  // ============ ÉTATS ============
  const [currentStep, setCurrentStep] = useState(1); // 1: Base, 2: Rôle, 3: Spécifique, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [groupeInfo, setGroupeInfo] = useState(null);
  
  // État du formulaire étendu
  const [formData, setFormData] = useState({
    // Étape 1: Informations de base
    email: invitedEmail,
    username: '',
    password: '',
    confirmPassword: '',
    prenom: '',
    nom: '',
    telephone: '',
    
    // Étape 2: Rôle
    role: '',
    
    // Étape 3: Champs spécifiques au rôle
    // Super Utilisateur
    groupeName: '',
    groupeDescription: '',
    groupeSiret: '',
    groupeAdresse: '',
    groupeEmail: '',
    groupeTelephone: '',
    groupeWebsite: '',
    
    // Utilisateur
    groupe_id: groupe_id,
    groupeName: '',
    compagnieName: '',
    compagnieSiret: '',
    compagnieDescription: '',
    compagnieEmail: '',
    compagnieTelephone: '',
    compagnieAdresse: '',
    compagnieWebsite: '',
    
    // Consultant
    registrationType: 'independent', // 'independent' ou 'firm'
    specialites: [],
    tarifHoraire: '',
    experienceYears: '',
    siret: '',
    contractTypes: [],
    firmType: '',
    firmName: '',
    firmSiret: '',
    firmDescription: '',
    
    // Invitation
    invitationToken: invitationToken
  });

  // ============ EFFETS ============
  
  // Charger les informations du groupe si groupe_id présent
  useEffect(() => {
    if (groupe_id) {
      fetchGroupeInfo(groupe_id);
    }
  }, [groupe_id]);

  // Vérifier si c'est une invitation
  useEffect(() => {
    if (invitationToken && invitedEmail) {
      validateInvitation(invitationToken, invitedEmail);
    }
  }, [invitationToken, invitedEmail]);

  // ============ FONCTIONS ============

  /**
   * Valider une invitation
   */
  const validateInvitation = async (token, email) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/validate-invitation`,
        {
          params: { token, email }
        }
      );
      
      if (response.data.valid) {
        addNotification({ 
          type: 'success', 
          title: 'Invitation valide !', 
          message: 'Veuillez compléter votre inscription.' 
        });
      }
    } catch (error) {
      addNotification({ 
        type: 'error', 
        title: 'Invitation invalide', 
        message: 'Invitation invalide ou expirée' 
      });
      navigate('/login');
    }
  };

  /**
   * Récupérer les informations du groupe
   */
  const fetchGroupeInfo = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/groupes/${id}` 
      );
      setGroupeInfo(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des informations du groupe:', error);
    }
  };

  /**
   * Vérifier disponibilité email en temps réel
   */
  const checkEmailAvailability = async (email) => {
    if (!email || email.length < 5 || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/check-email/${encodeURIComponent(email)}` 
      );
      console.log('🔵 [DEBUG] Email check response:', response.data);
      setEmailAvailable(response.data.available);
      if (!response.data.available) {
        setErrors(prev => ({
          ...prev,
          email: 'Cet email est déjà utilisé'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'email:', error.response?.status, error.response?.data);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  /**
   * Vérifier disponibilité username en temps réel
   */
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/check-username/${encodeURIComponent(username)}` 
      );
      console.log('🔵 [DEBUG] Username check response:', response.data);
      setUsernameAvailable(response.data.available);
      if (!response.data.available) {
        setErrors(prev => ({
          ...prev,
          username: 'Ce nom d\'utilisateur est déjà pris'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.username;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du nom d\'utilisateur:', error.response?.status, error.response?.data);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  /**
   * Calculer la force du mot de passe
   */
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[@$!%*?&]/.test(password)) strength += 20;
    
    setPasswordStrength(strength);
  };

  /**
   * Gestion des changements de formulaire
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
          setTimeout(() => checkEmailAvailability(value), 500);
        }
        break;
        
      case 'username':
        if (value.length < 3) {
          newErrors.username = 'Minimum 3 caractères';
        } else if (value.length > 30) {
          newErrors.username = 'Maximum 30 caractères';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Lettres, chiffres et underscore uniquement';
        } else {
          delete newErrors.username;
          setTimeout(() => checkUsernameAvailability(value), 500);
        }
        break;
        
      case 'password':
        calculatePasswordStrength(value);
        if (value.length < 8) {
          newErrors.password = 'Minimum 8 caractères';
        } else if (!/[a-z]/.test(value)) {
          newErrors.password = 'Doit contenir au moins une minuscule';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Doit contenir au moins une majuscule';
        } else if (!/[0-9]/.test(value)) {
          newErrors.password = 'Doit contenir au moins un chiffre';
        } else if (!/[@$!%*?&]/.test(value)) {
          newErrors.password = 'Doit contenir au moins un caractère spécial (@$!%*?&)';
        } else {
          delete newErrors.password;
        }
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'prenom':
        if (!value.trim()) {
          newErrors.prenom = 'Prénom requis';
        } else {
          delete newErrors.prenom;
        }
        break;
        
      case 'nom':
        if (!value.trim()) {
          newErrors.nom = 'Nom requis';
        } else {
          delete newErrors.nom;
        }
        break;
        
      case 'telephone':
        const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
        if (value && !phoneRegex.test(value)) {
          newErrors.telephone = 'Format de téléphone invalide';
        } else {
          delete newErrors.telephone;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  /**
   * Validation de l'étape 1 (Informations de base)
   */
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (emailAvailable === false) {
      newErrors.email = 'Cet email est déjà utilisé';
    }
    
    if (!formData.username) {
      newErrors.username = 'Nom d\'utilisateur requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 caractères';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Ce nom d\'utilisateur est déjà pris';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation du mot de passe requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Prénom requis';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Nom requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validation de l'étape 2 (Sélection du rôle)
   */
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.role) {
      newErrors.role = 'Veuillez sélectionner un rôle';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validation de l'étape 3 (Informations spécifiques)
   */
  const validateStep3 = () => {
    const newErrors = {};
    
    // Validation selon le rôle
    switch (formData.role) {
      case 'super_utilisateur':
        if (!formData.groupeName) {
          newErrors.groupeName = 'Nom du groupe requis';
        }
        if (formData.groupeSiret && !/^[A-Z0-9\/-]+$/i.test(formData.groupeSiret.replace(/\s/g, ''))) {
          newErrors.groupeSiret = 'Format RCCM invalide (lettres, chiffres, tirets et slashs)';
        }
        break;
        
      case 'utilisateur':
        if (!formData.groupe_id) {
          newErrors.groupe_id = 'Veuillez sélectionner un groupe';
        }
        if (!formData.compagnieName) {
          newErrors.compagnieName = 'Nom de l\'entreprise requis';
        }
        if (!formData.compagnieSiret || !/^[\d]{14}$/.test(formData.compagnieSiret.replace(/\s/g, ''))) {
          newErrors.compagnieSiret = 'SIRET de l\'entreprise requis';
        }
        break;
        
      case 'consultant':
      case 'super_consultant':
        if (!formData.specialites || formData.specialites.length === 0) {
          newErrors.specialites = 'Au moins une spécialité requise';
        }
        if (!formData.tarifHoraire || parseFloat(formData.tarifHoraire) <= 0) {
          newErrors.tarifHoraire = 'Tarif horaire requis et doit être positif';
        }
        if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) {
          newErrors.experienceYears = 'Années d\'expérience requises';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Navigation entre les étapes
   */
  const goToNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      addNotification({ 
        type: 'error', 
        title: 'Formulaire incomplet', 
        message: 'Veuillez corriger les erreurs avant de continuer' 
      });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    console.log('🔴 [DEBUG] handleSubmit DÉCLENCHÉ');
    e.preventDefault();
    console.log('🔴 [DEBUG] preventDefault() appliqué');
    
    // Valider toutes les étapes
    console.log('🔴 [DEBUG] Validation step 1...');
    const step1Valid = validateStep1();
    console.log('🔴 [DEBUG] Step 1 valide?', step1Valid);
    
    console.log('🔴 [DEBUG] Validation step 2...');
    const step2Valid = validateStep2();
    console.log('🔴 [DEBUG] Step 2 valide?', step2Valid);
    
    console.log('🔴 [DEBUG] Validation step 3...');
    const step3Valid = validateStep3();
    console.log('🔴 [DEBUG] Step 3 valide?', step3Valid);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      console.log('❌ [DEBUG] Validation échouée, erreurs:', errors);
      addNotification({ 
        type: 'error', 
        title: 'Formulaire invalide', 
        message: 'Veuillez corriger les erreurs dans le formulaire' 
      });
      return;
    }

    if (emailAvailable === false || usernameAvailable === false) {
      console.log('❌ [DEBUG] Email ou username non disponible');
      addNotification({ 
        type: 'error', 
        title: 'Disponibilité', 
        message: 'Email ou nom d\'utilisateur déjà utilisé' 
      });
      return;
    }

    setLoading(true);
    console.log('🔴 [DEBUG] Loading set to true');

    try {
      // Préparer le payload selon le rôle
      const payload = {
        // Champs de base
        email: formData.email,
        username: formData.username,
        password: formData.password,
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone || null,
        role: formData.role,
        
        // Champs spécifiques au rôle
        ...(formData.role === 'super_utilisateur' && {
          groupeName: formData.groupeName,
          groupeDescription: formData.groupeDescription,
          groupeSiret: formData.groupeSiret,
          groupeAdresse: formData.groupeAdresse,
          groupeEmail: formData.groupeEmail,
          groupeTelephone: formData.groupeTelephone,
          groupeWebsite: formData.groupeWebsite
        }),
        
        ...(formData.role === 'utilisateur' && {
          groupe_id: formData.groupe_id,
          compagnieName: formData.compagnieName,
          compagnieSiret: formData.compagnieSiret,
          compagnieDescription: formData.compagnieDescription,
          compagnieEmail: formData.compagnieEmail,
          compagnieTelephone: formData.compagnieTelephone,
          compagnieAdresse: formData.compagnieAdresse,
          compagnieWebsite: formData.compagnieWebsite
        }),
        
        ...(formData.role === 'consultant' && {
          specialites: formData.specialites,
          tarifHoraire: parseFloat(formData.tarifHoraire),
          experienceYears: parseInt(formData.experienceYears),
          siret: formData.siret,
          contractTypes: formData.contractTypes,
          registrationType: formData.registrationType,
          ...(formData.registrationType === 'firm' && {
            firmType: formData.firmType,
            firmName: formData.firmName,
            firmSiret: formData.firmSiret,
            firmDescription: formData.firmDescription
          })
        }),
        
        // Invitation
        invitationToken: formData.invitationToken || null
      };

      console.log('🔴 [DEBUG] Payload préparé:', payload);
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/register`;
      console.log('🔴 [DEBUG] API URL:', apiUrl);

      const response = await axios.post(
        apiUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('✅ [DEBUG] Réponse reçue:', response.data);
      const { user, requiresApproval, message } = response.data;

      if (requiresApproval) {
        console.log('ℹ️ [DEBUG] Approbation requise');
        addNotification({ 
          type: 'info', 
          title: 'Inscription soumise !', 
          message: 'En attente d\'approbation par un administrateur.' 
        });
        navigate('/login', {
          state: {
            message: 'Votre compte est en attente d\'approbation. Vous recevrez un email lorsque votre compte sera activé.',
            email: formData.email
          }
        });
      } else {
        console.log('✅ [DEBUG] Inscription sans approbation réussie');
        addNotification({ 
          type: 'success', 
          title: 'Inscription réussie !', 
          message: 'Vous pouvez maintenant vous connecter.' 
        });
        navigate('/login', {
          state: {
            message: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
            email: formData.email
          }
        });
      }

      // Log pour audit
      console.log('Nouvel utilisateur inscrit:', {
        user_id: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ [DEBUG] ERREUR lors de l\'inscription:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.response) {
        console.log('❌ [DEBUG] Erreur response status:', error.response.status);
        console.log('❌ [DEBUG] Erreur response data:', JSON.stringify(error.response.data, null, 2));
        console.log('❌ [DEBUG] Erreur response.data.errors:', JSON.stringify(error.response.data.errors, null, 2));
        if (error.response.data.errors) {
          const serverErrors = error.response.data.errors;
          setErrors(serverErrors);
          errorMessage = 'Veuillez corriger les erreurs ci-dessous';
          console.log('❌ [DEBUG] Erreurs détaillées:', JSON.stringify(serverErrors, null, 2));
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.log('❌ [DEBUG] Erreur request (pas de réponse):', error.request);
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else {
        console.log('❌ [DEBUG] Erreur:', error.message);
      }
      
      addNotification({ 
        type: 'error', 
        title: 'Erreur d\'inscription', 
        message: errorMessage 
      });
    } finally {
      setLoading(false);
      console.log('🔴 [DEBUG] Loading set to false');
    }
  };

  /**
   * Obtenir la couleur de force du mot de passe
   */
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#ef4444';
    if (passwordStrength <= 50) return '#f59e0b';
    if (passwordStrength <= 75) return '#3b82f6';
    return '#10b981';
  };

  /**
   * Rendre le contenu de l'étape actuelle
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3 className="step-title">Informations de connexion</h3>
            
            {/* Champ Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                <span>Adresse email *</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@entreprise.com"
                  disabled={loading || !!invitedEmail}
                  className={`form-input ${errors.email ? 'error' : ''} ${emailAvailable ? 'success' : ''}`}
                  autoComplete="email"
                />
                <div className="input-status">
                  {emailChecking && <Loader2 size={16} className="spinner" />}
                  {emailAvailable === true && <CheckCircle size={16} className="success-icon" />}
                  {emailAvailable === false && <XCircle size={16} className="error-icon" />}
                </div>
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            {/* Champ Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} />
                <span>Nom d'utilisateur *</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="john_doe"
                  disabled={loading}
                  className={`form-input ${errors.username ? 'error' : ''} ${usernameAvailable ? 'success' : ''}`}
                  autoComplete="username"
                  minLength="3"
                  maxLength="30"
                />
                <div className="input-status">
                  {usernameChecking && <Loader2 size={16} className="spinner" />}
                  {usernameAvailable === true && <CheckCircle size={16} className="success-icon" />}
                  {usernameAvailable === false && <XCircle size={16} className="error-icon" />}
                </div>
              </div>
              {errors.username && <div className="error-message">{errors.username}</div>}
              <div className="hint">3-30 caractères (lettres, chiffres, underscore)</div>
            </div>

            {/* Champ Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} />
                <span>Mot de passe *</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 caractères"
                  disabled={loading}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  autoComplete="new-password"
                  minLength="8"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
              
              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-label">
                    Force du mot de passe:
                    <span style={{ color: getPasswordStrengthColor() }}>
                      {passwordStrength <= 25 ? ' Faible' : 
                       passwordStrength <= 50 ? ' Moyen' : 
                       passwordStrength <= 75 ? ' Bon' : ' Fort'}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Champ Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} />
                <span>Confirmer le mot de passe *</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Retapez votre mot de passe"
                  disabled={loading}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            {/* Champs Prénom et Nom */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom" className="form-label">
                  <span>Prénom *</span>
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  placeholder="Jean"
                  disabled={loading}
                  className={`form-input ${errors.prenom ? 'error' : ''}`}
                  autoComplete="given-name"
                />
                {errors.prenom && <div className="error-message">{errors.prenom}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="nom" className="form-label">
                  <span>Nom *</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Dupont"
                  disabled={loading}
                  className={`form-input ${errors.nom ? 'error' : ''}`}
                  autoComplete="family-name"
                />
                {errors.nom && <div className="error-message">{errors.nom}</div>}
              </div>
            </div>

            {/* Champ Téléphone */}
            <div className="form-group">
              <label htmlFor="telephone" className="form-label">
                <span>Téléphone</span>
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="+221 77 123 45 67"
                disabled={loading}
                className={`form-input ${errors.telephone ? 'error' : ''}`}
                autoComplete="tel"
              />
              {errors.telephone && <div className="error-message">{errors.telephone}</div>}
              <div className="hint">Optionnel - Format international recommandé</div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3 className="step-title">Sélectionnez votre rôle</h3>
            <RoleSelector 
              selectedRole={formData.role}
              onRoleChange={(role) => setFormData(prev => ({ ...prev, role }))}
              disabled={loading}
            />
            {errors.role && <div className="error-message">{errors.role}</div>}
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3 className="step-title">Informations spécifiques au rôle</h3>
            
            {formData.role === 'super_utilisateur' && (
              <SuperUtilisateurForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={loading}
              />
            )}
            
            {formData.role === 'utilisateur' && (
              <UtilisateurForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={loading}
              />
            )}
            
            {(formData.role === 'consultant' || formData.role === 'super_consultant') && (
              <ConsultantForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                disabled={loading}
                role={formData.role}
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3 className="step-title">Confirmation de l'inscription</h3>
            
            <div className="creation-summary">
              <h4 className="summary-title">Résumé de votre inscription</h4>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Nom d'utilisateur:</span>
                  <span className="summary-value">{formData.username}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Nom complet:</span>
                  <span className="summary-value">{formData.prenom} {formData.nom}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Rôle:</span>
                  <span className="summary-value">
                    {formData.role === 'super_utilisateur' && 'Super Utilisateur'}
                    {formData.role === 'utilisateur' && 'Utilisateur'}
                    {formData.role === 'consultant' && 'Consultant'}
                    {formData.role === 'super_consultant' && 'Super Consultant'}
                  </span>
                </div>
                
                {/* Résumé spécifique au rôle */}
                {formData.role === 'super_utilisateur' && formData.groupeName && (
                  <div className="summary-item">
                    <span className="summary-label">Groupe à créer:</span>
                    <span className="summary-value">{formData.groupeName}</span>
                  </div>
                )}
                
                {formData.role === 'utilisateur' && formData.compagnieName && (
                  <div className="summary-item">
                    <span className="summary-label">Entreprise:</span>
                    <span className="summary-value">{formData.compagnieName}</span>
                  </div>
                )}
                
                {(formData.role === 'consultant' || formData.role === 'super_consultant') && (
                  <>
                    {formData.specialites && formData.specialites.length > 0 && (
                      <div className="summary-item">
                        <span className="summary-label">Spécialités:</span>
                        <span className="summary-value">{formData.specialites.join(', ')}</span>
                      </div>
                    )}
                    {formData.tarifHoraire && (
                      <div className="summary-item">
                        <span className="summary-label">Tarif horaire:</span>
                        <span className="summary-value">{parseInt(formData.tarifHoraire).toLocaleString()} FCFA</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="summary-item">
                  <span className="summary-label">Validation requise:</span>
                  <span className="summary-value approval-required">Oui</span>
                </div>
              </div>
            </div>
            
            <div className="important-note">
              <div className="note-icon">ℹ️</div>
              <div className="note-content">
                <p>
                  <strong>Confirmation :</strong> En soumettant cette inscription, vous acceptez que :
                </p>
                <ul>
                  <li>Vos informations seront vérifiées par un administrateur</li>
                  <li>Un email de confirmation vous sera envoyé après validation</li>
                  <li>Vous devrez suivre les règles et conditions de SPOFE</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============ RENDU ============
  return (
    <div className="register-page">
      {/* Header */}
      <header className="register-header">
        <div className="header-content">
          <div className="logo-section">
            <UserPlus size={32} className="logo-icon" />
            <h1 className="app-title">SPOFE v2.1</h1>
          </div>
          <div className="progress-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-circle">1</div>
              <span className="step-label">Compte</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Rôle</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Détails</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-circle">4</div>
              <span className="step-label">Validation</span>
            </div>
          </div>
        </div>
      </header>

      <main className="register-main">
        <div className="register-container">
          {/* Carte d'inscription */}
          <div className="register-card">
            <div className="card-header">
              <h2>Créer votre compte multi-groupes</h2>
              <p className="card-subtitle">
                Rejoignez SPOFE avec un rôle adapté à vos besoins
              </p>
            </div>

            {/* Bannière invitation */}
            {invitationToken && (
              <div className="invitation-banner success">
                <CheckCircle size={20} />
                <span>Vous avez été invité à rejoindre la plateforme</span>
              </div>
            )}

            {/* Informations groupe */}
            {groupeInfo && (
              <div className="groupe-banner info">
                <AlertCircle size={20} />
                <div>
                  <strong>Groupe :</strong> {groupeInfo.nom}
                  {groupeInfo.description && (
                    <p className="groupe-description">{groupeInfo.description}</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {renderStepContent()}

              {/* Actions de navigation */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    <ArrowLeft size={16} />
                    Précédent
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    Suivant
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spinner" />
                        <span>Inscription en cours...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Créer mon compte</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Liens de navigation */}
            <div className="register-footer">
              <p className="footer-text">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="login-link">
                  Se connecter
                </Link>
              </p>
              <p className="footer-hint">
                En créant un compte, vous acceptez nos{' '}
                <a href="/terms" className="link">Conditions d'utilisation</a> et notre{' '}
                <a href="/privacy" className="link">Politique de confidentialité</a>
              </p>
            </div>
          </div>

          {/* Colonne droite - Cartes de fonctionnalités */}
          <div className="features-sidebar">
            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h4>Enregistrement</h4>
              <p>Enregistrez-vous et créez votre compte pour accéder à toutes les fonctionnalités SPOFE adaptées à votre rôle</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Définir votre rôle</h4>
              <p>Spécifiez votre rôle au sein de l'écosystème professionnel SPOFE</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h4>Détails professionnels</h4>
              <p>Complétez vos informations professionnelles pour enrichir l'écosystème</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h4>Validation</h4>
              <p>Attendez la validation de votre inscription pour confirmer votre participation à l'écosystème</p>
            </div>

            {/* Nouvelles cartes - Avantages SPOFE */}
            <div className="feature-card advantage-card">
              <div className="feature-icon">📊</div>
              <h4>Tableaux de bord</h4>
              <p>Suivez vos performances avec des tableaux de bord interactifs et personnalisables</p>
            </div>

            <div className="feature-card advantage-card">
              <div className="feature-icon">🔗</div>
              <h4>Multi-groupes</h4>
              <p>Connectez-vous avec plusieurs groupes et entreprises dans un écosystème unifié</p>
            </div>

            {/* Section d'aide rapide */}
            <div className="help-card">
              <div className="help-icon">💡</div>
              <h4>Besoin d'aide ?</h4>
              <ul className="help-links">
                <li><a href="/guide" className="help-link">📖 Guide d'inscription</a></li>
                <li><a href="/faq" className="help-link">❓ Questions fréquentes</a></li>
                <li><a href="/support" className="help-link">📞 Contact support</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section informative */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-icon security">
              <Lock size={24} />
            </div>
            <h3>Sécurité maximale</h3>
            <p>Vos données sont chiffrées et protégées selon les standards bancaires</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon compliance">
              <CheckCircle size={24} />
            </div>
            <h3>Conforme OHADA</h3>
            <p>Respect strict du plan comptable OHADA pour les entreprises africaines</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon support">
              <AlertCircle size={24} />
            </div>
            <h3>Support dédié</h3>
            <p>Équipe technique disponible pour vous accompagner</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="register-page-footer">
        <div className="footer-content">
          <p className="copyright">
            © 2026 SPOFE v2.1 - Développé par <strong>Entreprises Performantes</strong>
          </p>
          <div className="footer-links">
            <a href="/about">À propos</a>
            <a href="/contact">Contact</a>
            <a href="/help">Aide</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPageExtended;
