import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import './LoginPage.css';

// Valeurs de test pour la démo
const TEST_EMAIL = "admin@spofe.com";
const TEST_PASSWORD = "demo123";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error: authError } = useAuth();
  const { addNotification } = useNotifications();
  
  // États
  const [formData, setFormData] = useState({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('[LoginPage] 🔐 Attempting login with:', formData.email);
      
      const result = await login(formData.email, formData.password);
      
      if (result.requires2FA) {
        // Rediriger vers 2FA
        navigate('/auth/two-factor', { 
          state: { 
            email: formData.email,
            tempToken: result.tempToken 
          } 
        });
        addNotification({
          type: 'info',
          title: 'Authentification à deux facteurs',
          message: 'Veuillez saisir votre code TOTP'
        });
      } else {
        // Connexion réussie
        navigate('/dashboard');
        addNotification({
          type: 'success',
          title: 'Connexion réussie',
          message: `Bienvenue sur SPOFE v2.1`,
          duration: 5000
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Échec de connexion',
        message: error.message || 'Identifiants incorrects',
        duration: 10000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si chargement initial
  if (isLoading) {
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
        {/* Header avec Logo SPOFE */}
        <div className="login-header">
          <div className="logo-placeholder">
            <h1 className="title">SPOFE v2.1</h1>
          </div>
          <p className="subtitle">Système de Pilotage Opérationnel et Financier Étendu</p>
        </div>

        {/* Messages d'erreur */}
        {authError && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Formulaire */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              📧 Adresse Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="exemple@entreprise.sn"
              autoComplete="email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔒 Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Se souvenir de moi</span>
            </label>
            
            <Link to="/auth/forgot-password" className="forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small">⟳</span>
                Connexion en cours...
              </>
            ) : (
              <>
                🔑 Se connecter
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="demo-info">
            <p className="demo-text">
              ℹ️ Version de démonstration - Données factices
            </p>
          </div>
          
          <div className="copyright">
            <p>© 2026 SPOFE v2.1 - Système OHADA Multi-Compagnies</p>
            <p className="version">Version 2.1.0 Production Ready</p>
          </div>
          
          <div className="support">
            <Link to="/support" className="support-link">
              ❓ Support technique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
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
        setTwoFactorCode(['', '', '', '', '', '']);
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
    setTwoFactorCode(['', '', '', '', '', '']);
    setCodeSuccess(false);
    setCodeError(false);
  };

  const handleCodeInputChange = (index, value) => {
    // N'autoriser que les chiffres
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);
    
    // Passer au champ suivant si une valeur est saisie
    if (value && index < 5 && codeInputRefs.current[index + 1]) {
      codeInputRefs.current[index + 1].focus();
    }
    
    // Auto-vérification si tous les champs sont remplis
    if (newCode.every(digit => digit !== '') && newCode.length === 6) {
      setTimeout(() => handle2FAVerify(), 100);
    }
  };

  const handleCodeInputKeyDown = (index, e) => {
    // Gérer la suppression
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      codeInputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...twoFactorCode];
      
      digits.forEach((digit, idx) => {
        if (idx < 6) {
          newCode[idx] = digit;
        }
      });
      
      setTwoFactorCode(newCode);
      
      // Focus sur le dernier champ
      if (codeInputRefs.current[Math.min(5, digits.length - 1)]) {
        codeInputRefs.current[Math.min(5, digits.length - 1)].focus();
      }
      
      // Déclencher la vérification automatique
      setTimeout(() => {
        if (newCode.every(digit => digit !== '')) {
          handle2FAVerify();
        }
      }, 100);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="version">v2.1</div>
        
        {/* Logo au centre en haut */}
        <div className="login-header">
          <div className="logo-container">
            <img src="/logo-spofe.png" alt="SPOFE Logo" className="logo-image" />
          </div>
        </div>
        
        {/* Cartes à gauche */}
        <div className="left-cards">
          <div className="info-card">
            <i className="fas fa-chart-line"></i>
            <h4>Conformité OHADA</h4>
            <p>Respect strict du plan comptable OHADA et mise à jour automatique des normes réglementaires</p>
          </div>
          <div className="info-card">
            <i className="fas fa-hands-helping"></i>
            <h4>Accompagnement</h4>
            <p>Coaching, mentorat et formation continue pour optimiser l&apos;utilisation du système par vos équipes</p>
          </div>
        </div>
        
        {/* Boîte de connexion au centre */}
        <div className="login-card">
          {/* Message de succès */}
          {loginSuccess && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i> Connexion réussie ! Redirection vers le tableau de bord...
            </div>
          )}
          
          {/* Message d'erreur */}
          {error && !loginSuccess && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          
          {/* Formulaire de connexion */}
          <form id="loginForm" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="votre.email@entreprise.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              id="loginBtn"
              disabled={loading}
            >
              <span id="btnText">
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </span>
              {loading && <div className="loading"></div>}
            </button>
          </form>
          
          <div className="login-footer">
            <a href="#" className="forgot-link">Mot de passe oublié ?</a>
            <div className="divider">|</div>
            <a href="#" className="register-link">Créer un compte</a>
          </div>
        </div>
        
        {/* Cartes à droite */}
        <div className="right-cards">
          <div className="info-card">
            <i className="fas fa-shield-alt"></i>
            <h4>Sécurité Bancaire</h4>
            <p>Authentification 2FA et chiffrement de niveau bancaire pour une protection maximale de vos données financières</p>
          </div>
          <div className="info-card">
            <i className="fas fa-building"></i>
            <h4>Multi-Compagnies</h4>
            <p>Gestion centralisée et consolidée pour groupes d&apos;entreprises avec rapports individuels et consolidés</p>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="copyright">
        Spofe app développer par Entreprises Performantes
      </div>
      
      {/* Modal 2FA */}
      <div className={`modal-overlay ${show2FAModal ? 'active' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <i className="fas fa-shield-alt"></i>
            <h3>Vérification en deux étapes</h3>
            <p className="modal-message">
              Pour votre sécurité, un code de vérification à 6 chiffres a été envoyé à votre adresse email <strong>{email}</strong>.<br />
              Veuillez le saisir ci-dessous pour finaliser votre connexion.
            </p>
          </div>
          
          <div className="modal-body">
            <div className="code-inputs">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  className="code-input"
                  maxLength="1"
                  value={twoFactorCode[index]}
                  onChange={(e) => handleCodeInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeInputKeyDown(index, e)}
                  onPaste={handlePaste}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  autoComplete="off"
                  disabled={codeSuccess}
                />
              ))}
            </div>
            
            {codeSuccess && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i> Code vérifié avec succès ! Redirection en cours...
              </div>
            )}
            
            {codeError && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle"></i> Code incorrect. Veuillez réessayer.
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#718096' }}>
              <i className="fas fa-info-circle"></i> Vous n&apos;avez pas reçu le code ?{' '}
              <a href="#" style={{ color: '#4299e1', textDecoration: 'none', fontWeight: '600' }}>
                Renvoyer le code
              </a>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handle2FACancel}>
              Annuler
            </button>
            <button 
              className="btn btn-primary" 
              id="verify2FA"
              onClick={handle2FAVerify}
              disabled={twoFactorCode.some(digit => digit === '') || codeSuccess}
            >
              Vérifier le code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
