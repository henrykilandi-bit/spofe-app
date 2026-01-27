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
