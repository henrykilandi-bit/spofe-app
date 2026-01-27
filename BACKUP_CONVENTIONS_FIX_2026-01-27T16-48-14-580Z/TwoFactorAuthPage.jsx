import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import apiClient from '../services/api.config';
import './TwoFactorAuthPage.css';

const TwoFactorAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUserData } = useAuthContext();
  
  // États
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('admin@spofe.com');
  const [tempToken, setTempToken] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState('authenticator'); // 'authenticator', 'sms', 'email'
  const [phoneNumber, setPhoneNumber] = useState('+33 6 12 34 56 78');
  
  // États intelligents
  const [confidentialMode, setConfidentialMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const [showSmartFeatures, setShowSmartFeatures] = useState(false);
  
  // Références pour les champs de code
  const inputRefs = useRef([]);
  
  // Instructions par méthode
  const instructions = {
    authenticator: 'Ouvrez votre application d\'authentification et entrez le code à 5 chiffres affiché.',
    sms: `Un code a été envoyé au numéro <strong>${phoneNumber}</strong>. Entrez-le ci-dessous.`,
    email: `Un code a été envoyé à <strong>${email}</strong>. Vérifiez votre boîte de réception.`
  };

  // ============ FONCTIONNALITÉS INTELLIGENTES ============

  // 1. Détection de connexion lente
  const detectSlowConnection = () => {
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.downlink < 1) { // Moins de 1 Mbps
        setSlowConnection(true);
        setSuccess('⚠️ Connexion lente détectée. L\'authentification peut prendre plus de temps.');
        setTimeout(() => setSuccess(''), 5000);
      }
    }
  };

  // 2. Suggestion de méthode préférée
  const suggestPreferredMethod = () => {
    try {
      const preferredMethod = localStorage.getItem('preferred2FAMethod');
      if (preferredMethod && ['authenticator', 'sms', 'email'].includes(preferredMethod) && preferredMethod !== verificationMethod) {
        setTimeout(() => {
          setSuccess(`💡 Méthode préférée détectée: ${preferredMethod}. Changement dans 3s...`);
          setTimeout(() => changeVerificationMethod(preferredMethod), 3000);
        }, 500);
      }
    } catch (err) {
      console.warn('[2FA] Impossible de lire localStorage:', err);
    }
  };

  // 3. Analyse de la force du code
  const analyzeCodeStrength = (codeStr) => {
    if (!codeStr || codeStr.length !== 5) return null;
    
    const patterns = {
      sequential: /12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/,
      repeated: /(\d)\1{4}/,
      sameNumber: /^(\d)\1+$/
    };
    
    for (const [patternName, pattern] of Object.entries(patterns)) {
      if (pattern.test(codeStr)) {
        return {
          weak: true,
          reason: patternName === 'sequential' ? 'Séquence trop simple' :
                 patternName === 'repeated' ? 'Chiffres répétés' :
                 'Même chiffre'
        };
      }
    }
    
    return { weak: false };
  };

  // 4. Génération de codes de secours
  const generateBackupCodes = () => {
    try {
      const codes = [];
      for (let i = 0; i < 5; i++) {
        codes.push(Math.floor(10000 + Math.random() * 90000));
      }
      
      // Sauvegarder en localStorage (simple démonstration)
      localStorage.setItem('backup2FACodes', JSON.stringify(codes));
      setBackupCodesGenerated(true);
      
      // Afficher une suggestion après 2 secondes
      setTimeout(() => {
        setSuccess('💡 Codes de secours générés. Gardez-les dans un endroit sûr!');
      }, 2000);
    } catch (err) {
      console.warn('[2FA] Impossible de générer codes de secours:', err);
    }
  };

  // 5. Détection d'activité suspecte
  const detectSuspiciousActivity = () => {
    try {
      const loginTime = new Date().getHours();
      const wasLateNight = loginTime < 6 || loginTime > 22;
      
      const lastLocation = localStorage.getItem('lastLoginLocation');
      const currentLocation = 'Dakar'; // À adapter selon la géolocalisation réelle
      
      if (lastLocation && lastLocation !== currentLocation && lastLocation !== 'unknown') {
        setSuccess(`⚠️ Connexion depuis une nouvelle localisation (${currentLocation}).`);
      }
      
      localStorage.setItem('lastLoginLocation', currentLocation);
    } catch (err) {
      console.warn('[2FA] Impossible de détecter activité suspecte:', err);
    }
  };

  // 6. Enregistrement des tentatives échouées
  const recordFailedAttempt = () => {
    try {
      const attempts = parseInt(localStorage.getItem('failed2FAAttempts') || '0') + 1;
      localStorage.setItem('failed2FAAttempts', attempts.toString());
      setFailedAttempts(attempts);
      
      if (attempts >= 3) {
        setError('⚠️ Plusieurs tentatives échouées. Vérifiez votre source de code ou contactez le support.');
      }
    } catch (err) {
      console.warn('[2FA] Impossible d\'enregistrer tentative échouée:', err);
    }
  };

  // 7. Réinitialiser les tentatives échouées après succès
  const resetFailedAttempts = () => {
    try {
      localStorage.setItem('failed2FAAttempts', '0');
      setFailedAttempts(0);
    } catch (err) {
      console.warn('[2FA] Impossible de réinitialiser tentatives:', err);
    }
  };

  // ============ FIN FONCTIONNALITÉS INTELLIGENTES ============
  
  // Initialisation depuis la navigation
  useEffect(() => {
    const state = location.state;
    if (state?.tempToken && state?.email) {
      setTempToken(state.tempToken);
      setEmail(state.email);
    }
    
    if (state?.phoneNumber) {
      setPhoneNumber(state.phoneNumber);
    }
    
    // Vérifier que nous avons un token temporaire
    if (!state?.tempToken) {
      console.warn('[2FA] ⚠️ Pas de tempToken trouvé - redirection vers login');
      navigate('/login', { replace: true });
    }
    
    // Démarrer le compte à rebours pour le renvoi
    setResendCountdown(30);
    
    // Initialiser les fonctionnalités intelligentes
    setTimeout(() => {
      detectSlowConnection();
      suggestPreferredMethod();
      detectSuspiciousActivity();
      generateBackupCodes();
    }, 500);
    
    // Charger le dark mode depuis les préférences
    try {
      const savedDarkMode = localStorage.getItem('darkMode2FA') === 'true';
      setDarkMode(savedDarkMode);
    } catch (err) {
      console.warn('[2FA] Impossible de charger préférences dark mode:', err);
    }
  }, [location, navigate]);
  
  // Compte à rebours pour renvoyer le code
  useEffect(() => {
    if (resendCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCountdown]);
  
  // Focus sur le premier champ au chargement
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  const sendVerificationCode = async (method) => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = method === 'sms' 
        ? '/auth/send-sms-code' 
        : '/auth/send-email-code';
      
      const response = await apiClient.post(endpoint, {
        token: tempToken,
        phone: phoneNumber,
        email: email
      });
      
      if (response.data.success) {
        setSuccess(`Code envoyé par ${method === 'sms' ? 'SMS' : 'email'}`);
        setResendCountdown(30);
      }
    } catch (error) {
      console.error('[2FA] Erreur lors de l\'envoi du code:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCodeChange = (index, value) => {
    // Accepter uniquement les chiffres
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-navigation vers le champ suivant
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Vérification automatique quand tous les champs sont remplis
    if (newCode.every(digit => digit !== '') && index === 4) {
      const fullCode = newCode.join('');
      
      // Analyser la force du code (intelligent)
      const strength = analyzeCodeStrength(fullCode);
      if (strength && strength.weak) {
        setError(`⚠️ Code faible détecté (${strength.reason}). Veuillez saisir un autre code.`);
        shakeInputs();
        // Ne pas vérifier automatiquement
        return;
      }
      
      // Vérifier après 300ms
      setTimeout(() => verifyCode(), 300);
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Backspace: revenir au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    // Flèches: navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 4) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Vérifier si c'est un code à 5 chiffres
    if (/^\d{5}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...code];
      
      digits.forEach((digit, index) => {
        if (index < 5) {
          newCode[index] = digit;
        }
      });
      
      setCode(newCode);
      
      // Focus sur le dernier champ
      if (inputRefs.current[4]) {
        inputRefs.current[4].focus();
      }
      
      // Vérification automatique
      setTimeout(() => verifyCode(), 100);
    }
  };
  
  const verifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 5) {
      setError('Le code doit contenir 5 chiffres');
      shakeInputs();
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('[2FA] 🔐 Vérification du code 2FA...');
      
      // Appel API réel pour vérifier le code 2FA
      const response = await apiClient.post('/auth/verify-2fa', {
        token: tempToken,
        code: verificationCode,
        method: verificationMethod
      });
      
      if (response.data?.data?.token && response.data?.data?.user) {
        const { token, user } = response.data.data;
        
        console.log('[2FA] ✅ Code 2FA vérifié avec succès');
        
        // Réinitialiser les tentatives échouées (intelligent)
        resetFailedAttempts();
        
        // Sauvegarder la méthode de vérification préférée (intelligent)
        try {
          localStorage.setItem('preferred2FAMethod', verificationMethod);
        } catch (err) {
          console.warn('[2FA] Impossible de sauvegarder méthode préférée:', err);
        }
        
        // Sauvegarder le token et les infos utilisateur
        setToken(token);
        setUserData(user);
        
        setSuccess('✅ Authentification réussie ! Redirection vers le tableau de bord...');
        
        // Redirection vers le dashboard après 1.5s
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        throw new Error('Réponse serveur invalide');
      }
    } catch (error) {
      console.error('[2FA] ❌ Erreur de vérification:', error);
      
      // Enregistrer la tentative échouée (intelligent)
      recordFailedAttempt();
      
      setError(error.response?.data?.message || 'Code incorrect. Veuillez réessayer.');
      shakeInputs();
      
      // Réinitialiser le code après erreur
      setTimeout(() => {
        setCode(['', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = () => {
    if (resendCountdown > 0 || loading) return;
    
    if (verificationMethod === 'sms') {
      sendVerificationCode('sms');
    } else if (verificationMethod === 'email') {
      sendVerificationCode('email');
    } else {
      // Pour l'authenticator, on ne peut pas renvoyer
      setSuccess('Consultez votre application d\'authentification pour le code actuel');
      setResendCountdown(30);
    }
  };
  
  const changeVerificationMethod = (method) => {
    setVerificationMethod(method);
    setError('');
    setSuccess('');
    setCode(['', '', '', '', '']);
    
    // Focus sur le premier champ
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);
    
    // Si on change vers SMS/Email, envoyer immédiatement un code
    if (method !== 'authenticator') {
      sendVerificationCode(method);
    }
  };

  // Raccourcis clavier intelligents
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Ctrl+Alt+1,2,3 pour changer de méthode
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        if (e.key === '1') {
          changeVerificationMethod('authenticator');
          setSuccess('💡 Méthode changée: Authenticator (raccourci Ctrl+Alt+1)');
        } else if (e.key === '2') {
          changeVerificationMethod('sms');
          setSuccess('💡 Méthode changée: SMS (raccourci Ctrl+Alt+2)');
        } else if (e.key === '3') {
          changeVerificationMethod('email');
          setSuccess('💡 Méthode changée: Email (raccourci Ctrl+Alt+3)');
        }
      }
      
      // Ctrl+Enter pour vérifier
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!code.some(digit => digit === '') && !loading) {
          verifyCode();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [code, loading, verificationMethod]);
  
  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };
  
  const shakeInputs = () => {
    inputRefs.current.forEach(ref => {
      if (ref) {
        ref.classList.add('error-shake');
        setTimeout(() => ref.classList.remove('error-shake'), 500);
      }
    });
  };
  
  return (
    <div className={`twofactor-auth-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Contrôles intelligents en haut à droite */}
      <div className="smart-controls">
        <button 
          className="smart-control-btn" 
          onClick={() => setConfidentialMode(!confidentialMode)}
          title="Masquer les chiffres"
          aria-label="Mode confidentiel"
        >
          <i className={`fas fa-${confidentialMode ? 'eye' : 'eye-slash'}`}></i>
        </button>
        
        <button 
          className="smart-control-btn" 
          onClick={() => {
            setDarkMode(!darkMode);
            try {
              localStorage.setItem('darkMode2FA', (!darkMode).toString());
            } catch (err) {
              console.warn('[2FA] Impossible de sauvegarder dark mode:', err);
            }
          }}
          title="Mode sombre"
          aria-label="Basculer dark mode"
        >
          <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
        </button>
        
        <button 
          className="smart-control-btn" 
          onClick={() => setShowSmartFeatures(!showSmartFeatures)}
          title="Fonctionnalités intelligentes"
          aria-label="Afficher les fonctionnalités intelligentes"
        >
          <i className="fas fa-robot"></i>
        </button>
      </div>

      <div className="twofactor-container">
        {/* En-tête */}
        <div className="twofactor-header">
          <div className="logo-container">
            <div className="logo-icon">🔒</div>
            <div>
              <h1>SPOFE</h1>
              <span className="acronym">Système de Pilotage et d'Optimisation Financière des Entreprises</span>
              <div className="full-name">Solution intégrée de gestion financière et de pilotage d'entreprise</div>
            </div>
          </div>
          <div className="version-badge">v2.1</div>
        </div>
        
        {/* Carte principale */}
        <div className="twofactor-card">
          <div className="twofactor-title">
            <h2>Vérification en deux étapes</h2>
            <p className="user-email">{email}</p>
          </div>
          
          {/* Sélecteur de méthode */}
          <div className="method-selector">
            <div className="method-options">
              <button 
                className={`method-btn ${verificationMethod === 'authenticator' ? 'active' : ''}`}
                onClick={() => changeVerificationMethod('authenticator')}
                disabled={loading}
              >
                <i className="fas fa-mobile-alt"></i>
                <span>App Authenticator</span>
              </button>
              
              <button 
                className={`method-btn ${verificationMethod === 'sms' ? 'active' : ''}`}
                onClick={() => changeVerificationMethod('sms')}
                disabled={loading}
              >
                <i className="fas fa-sms"></i>
                <span>SMS</span>
              </button>
              
              <button 
                className={`method-btn ${verificationMethod === 'email' ? 'active' : ''}`}
                onClick={() => changeVerificationMethod('email')}
                disabled={loading}
              >
                <i className="fas fa-envelope"></i>
                <span>Email</span>
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="instructions">
            <p className="instruction-text" dangerouslySetInnerHTML={{
              __html: `<i class="fas fa-info-circle"></i> ${instructions[verificationMethod]}`
            }} />
            
            {verificationMethod === 'authenticator' && (
              <div className="timer-info">
                <i className="fas fa-clock"></i>
                <span>Le code change toutes les 30 secondes</span>
              </div>
            )}
          </div>
          
          {/* Champs de saisie du code */}
          <div className="code-input-container">
            <label className="code-label">
              Code de vérification (5 chiffres)
            </label>
            
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type={confidentialMode ? 'password' : 'text'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="code-input"
                  disabled={loading}
                  autoComplete="off"
                  aria-label={`Chiffre ${index + 1} du code`}
                  data-index={index}
                />
              ))}
            </div>
            
            <div className="code-hint">
              <i className="fas fa-lightbulb"></i>
              <span>
                Appuyez sur Ctrl+V pour coller un code complet
                {confidentialMode && ' • Mode confidentiel activé'}
              </span>
            </div>
          </div>
          
          {/* Affichage des fonctionnalités intelligentes activées */}
          {showSmartFeatures && (
            <div className="smart-features-info">
              <h4 className="smart-features-title">
                <i className="fas fa-robot"></i> Fonctionnalités intelligentes
              </h4>
              <div className="features-grid">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Auto-vérification quand code complet</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Analyse de la force du code</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Mode confidentiel (masquer chiffres)</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Détection d'activité suspecte</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Génération de codes de secours</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Raccourcis clavier (Ctrl+Alt+1/2/3)</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Détection connexion lente</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>✅ Suggestion méthode préférée</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Bouton de vérification */}
          <button
            className="verify-btn"
            onClick={verifyCode}
            disabled={loading || code.some(digit => digit === '')}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Vérification en cours...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle"></i>
                Vérifier le code
              </>
            )}
          </button>
          
          {/* Bouton renvoyer le code */}
          <div className="resend-container">
            <button
              className="resend-btn"
              onClick={handleResendCode}
              disabled={resendCountdown > 0 || loading}
            >
              <i className="fas fa-redo"></i>
              {resendCountdown > 0 
                ? `Renvoyer (${resendCountdown}s)` 
                : 'Renvoyer le code'}
            </button>
          </div>
          
          {/* Bouton retour */}
          <button
            className="back-btn"
            onClick={handleBackToLogin}
            disabled={loading}
          >
            <i className="fas fa-arrow-left"></i>
            Retour à la connexion
          </button>
          
          {/* Messages d'alerte */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}
        </div>
        
        {/* Informations de sécurité */}
        <div className="security-info">
          <div className="info-card">
            <i className="fas fa-shield-alt"></i>
            <h4>Sécurité renforcée</h4>
            <p>L'authentification à deux facteurs protège votre compte même si votre mot de passe est compromis.</p>
          </div>
          
          <div className="info-card">
            <i className="fas fa-question-circle"></i>
            <h4>Besoin d'aide ?</h4>
            <p>Si vous ne recevez pas de code, vérifiez votre application d'authentification ou contactez le support.</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="twofactor-footer">
          <p className="copyright">
            <i className="fas fa-copyright"></i> 2026 SPOFE v2.1 - Tous droits réservés
          </p>
          <p>
            Développé par <span className="developer">Entreprises Performantes</span>
          </p>
          <div className="footer-links">
            <a href="#"><i className="fas fa-headset"></i> Support</a>
            <a href="#"><i className="fas fa-lock"></i> Confidentialité</a>
            <a href="#"><i className="fas fa-file-contract"></i> Conditions</a>
            <a href="#"><i className="fas fa-info-circle"></i> À propos</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
