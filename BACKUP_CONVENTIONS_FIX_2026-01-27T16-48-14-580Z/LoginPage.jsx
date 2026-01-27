import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import apiClient from '../services/api.config';
import './LoginPage.css';

// Valeurs de test pour la démo
const TEST_EMAIL = "admin@spofe.sn";
const TEST_PASSWORD = "admin123";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUserData } = useAuthContext();
  const { addNotification } = useNotifications();
  
  // États
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '', '']);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Références pour les champs de code 2FA
  const codeInputRefs = useRef([]);
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Pré-remplir avec les identifiants de test pour faciliter la démo
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setLoginSuccess(false);
    
    try {
      console.log('[LoginPage] 🔐 Attempting login with:', email);
      
      // Appel API réel
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });
      
      const { token, user, requiresTwoFA } = response.data?.data || response.data;
      
      console.log('[LoginPage] ✅ Login response received:', { 
        hasToken: !!token, 
        userEmail: user?.email, 
        requiresTwoFA,
        statusCode: response.status 
      });

      if (requiresTwoFA && token) {
        // ✅ L'API requiert une vérification 2FA
        console.log('[LoginPage] 🔐 Redirection vers page 2FA complète');
        addNotification({
          type: 'info',
          title: '🔐 Vérification 2FA requise',
          message: 'Veuillez vérifier votre identité via 2FA',
          category: 'auth',
          duration: 5000
        });
        
        // Rediriger vers la page 2FA avec le token temporaire
        navigate('/two-factor-auth', {
          state: {
            tempToken: token,
            email: email,
            phoneNumber: user?.phoneNumber || '+33 6 12 34 56 78'
          },
          replace: true
        });
      } else if (token && user) {
        // Succès direct (2FA désactivée)
        setToken(token);
        setUserData(user);
        setLoginSuccess(true);
        
        addNotification({
          type: 'success',
          title: '✅ Connexion réussie',
          message: `Bienvenue ${user.email}!`,
          category: 'auth',
          duration: 3000
        });
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        const msg = 'Réponse serveur invalide';
        setError(msg);
        addNotification({
          type: 'error',
          title: '❌ Erreur',
          message: msg,
          category: 'auth'
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message ||
                          'Erreur de connexion';
      console.error('[LoginPage] ❌ Login error:', errorMessage);
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: '❌ Erreur de connexion',
        message: errorMessage,
        category: 'auth'
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    const code = twoFactorCode.join('');
    
    if (!code || code.length !== 6) {
      setCodeError(true);
      return;
    }
    
    try {
      console.log('[LoginPage] 🔐 Verifying 2FA code');
      
      // Appel API pour vérifier le code 2FA
      const response = await apiClient.post('/auth/verify-2fa', {
        token: tempToken,
        code
      });
      
      const { token, user } = response.data?.data || response.data;
      
      if (token && user) {
        setCodeError(false);
        setCodeSuccess(true);
        
        // Désactiver le bouton de vérification
        const verifyBtn = document.getElementById('verify2FA');
        if (verifyBtn) {
          verifyBtn.disabled = true;
          verifyBtn.innerHTML = '<i class="fas fa-check"></i> Vérification réussie';
        }
        
        // Sauvegarder le token et l'utilisateur
        setToken(token);
        setUserData(user);
        
        setTimeout(() => {
          setShow2FAModal(false);
          setLoginSuccess(true);
          
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        }, 1500);
      } else {
        setCodeError(true);
        throw new Error('Réponse 2FA invalide');
      }
    } catch (err) {
      setCodeSuccess(false);
      setCodeError(true);
      console.error('[LoginPage] ❌ 2FA verification error:', err.message);
      
      // Animation de secousse
      codeInputRefs.current.forEach(input => {
        if (input) {
          input.style.animation = 'none';
          setTimeout(() => {
            input.style.animation = 'shake 0.5s';
          }, 10);
        }
      });
      
      // Réinitialiser les champs après un délai
      setTimeout(() => {
        setTwoFactorCode(['', '', '', '', '', '', '']);
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
        
        // Cacher l'erreur après quelques secondes
        setTimeout(() => {
          setCodeError(false);
        }, 3000);
      }, 500);
    }
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    setTempToken(null);
    setTwoFactorCode(['', '', '', '', '', '', '']);
    setCodeSuccess(false);
    setCodeError(false);
  };

  const handleCodeInputChange = (index, value) => {
    // Uniquement accepter les chiffres
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const newCode = [...twoFactorCode];
    newCode[index] = numericValue;
    setTwoFactorCode(newCode);
    
    // Passer au champ suivant automatiquement
    if (numericValue && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
    
    // Effacer l'erreur si l'utilisateur commence à taper
    if (codeError) {
      setCodeError(false);
    }
  };

  const handleCodeKeyDown = (index, e) => {
    // Revenir au champ précédent avec Backspace
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
    
    // Soumettre avec Enter
    if (e.key === 'Enter' && twoFactorCode.every(code => code.length === 1)) {
      handle2FAVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numericData = pastedData.replace(/[^0-9]/g, '');
    
    if (numericData.length === 6) {
      const newCode = numericData.split('');
      setTwoFactorCode(newCode);
      
      // Focus sur le dernier champ
      setTimeout(() => {
        codeInputRefs.current[5]?.focus();
      }, 0);
    }
  };

  // Si chargement initial
  if (loading && !show2FAModal) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">SPOFE</span>
            </div>
          </div>
          <h1 className="title">SPOFE <span className="version-badge">v2.1</span></h1>
          <p className="subtitle">Système de Pilotage et d'Optimisation Financière des Entreprises</p>
        </div>

        {/* Carte OHADA */}
        <div className="ohada-card">
          <div className="card-icon">📊</div>
          <h3 className="card-title">Conformité OHADA</h3>
          <p className="card-description">
            Respect strict du plan comptable OHADA avec mises à jour automatiques des normes réglementaires en vigueur.
          </p>
          <ul className="card-features">
            <li>Plan comptable normalisé</li>
            <li>États financiers standards</li>
            <li>Rapports réglementaires</li>
          </ul>
        </div>

        {/* Carte Multi-Compagnies */}
        <div className="multi-company-card">
          <div className="card-icon">🏢</div>
          <h3 className="card-title">Multi-Compagnies</h3>
          <p className="card-description">
            Gestion centralisée et consolidée pour groupes d'entreprises avec rapports individuels et consolidés.
          </p>
          <ul className="card-features">
            <li>Groupes d'entreprises</li>
            <li>Rapports consolidés</li>
            <li>Gestion hiérarchique</li>
          </ul>
        </div>

        {/* Carte de connexion */}
        <div className="login-form-container">
          {/* Alertes */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>Connexion réussie ! Redirection vers le tableau de bord...</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="votre.email@entreprise.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
              />
              <span className="checkbox-text">Se souvenir de moi</span>
            </label>
            
            <a href="/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </a>
            
            <Link to="/register" className="create-account-link">
              <i className="fas fa-user-plus"></i> Créer un compte
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">Développé par Entreprises Performantes</p>
          <p className="footer-year">SPOFE 2026</p>
        </div>

        {/* Carte Sécurité */}
        <div className="security-card">
          <div className="card-icon">🔒</div>
          <h3 className="card-title">Sécurité Bancaire</h3>
          <p className="card-description">
            Authentification 2FA et chiffrement de niveau bancaire pour une protection maximale de vos données financières.
          </p>
          <ul className="card-features">
            <li>Authentification 2FA</li>
            <li>Chiffrement bout en bout</li>
            <li>Audit trail complet</li>
          </ul>
        </div>

        {/* Carte Accompagnement */}
        <div className="support-card">
          <div className="card-icon">🤝</div>
          <h3 className="card-title">Accompagnement</h3>
          <p className="card-description">
            Coaching, mentorat et formation continue pour optimiser l'utilisation du système par vos équipes.
          </p>
          <ul className="card-features">
            <li>Formation continue</li>
            <li>Support technique</li>
            <li>Coaching personnalisé</li>
          </ul>
        </div>
      </div>

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <div className="modal-header">
              <i className="fas fa-shield-alt"></i>
              <h2 className="modal-title">Vérification en deux étapes</h2>
              <p className="modal-description">
                Pour votre sécurité, un code de vérification à 6 chiffres a été envoyé à votre adresse email <strong>{email}</strong>.<br />
                Veuillez le saisir ci-dessous pour finaliser votre connexion.
              </p>
            </div>
            
            <div className="code-input-container">
              {twoFactorCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`code-input ${codeError ? 'input-error' : ''} ${codeSuccess ? 'input-success' : ''}`}
                />
              ))}
            </div>

            {codeError && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                Code incorrect. Veuillez réessayer.
              </div>
            )}

            {codeSuccess && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                Code vérifié avec succès ! Redirection en cours...
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handle2FACancel}>
                Annuler
              </button>
              <button 
                className="btn-primary" 
                onClick={handle2FAVerify}
                disabled={twoFactorCode.some(code => !code)}
              >
                <i className="fas fa-check"></i>
                Vérifier le code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
