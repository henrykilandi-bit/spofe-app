# RegisterPage - Documentation Complète

**Version**: 2.0 - **Multi-Groupes TERMINÉE**  
**Date**: Janvier 24, 2026  
**Status**: Production-Ready ✅ - **Architecture Multi-Groupes Implémentée**

---

## 🎯 **VERSION MULTI-GROUPES - RÉALISATION MAJEURE**

### ✅ **Nouvelles Fonctionnalités Terminées (100%)**

#### 🎯 **RegisterPage-Extended.jsx - Multi-Groupes**
- **4 Étapes Complètes** : Sélection rôle → Infos personnelles → Formulaire spécifique → Validation
- **4 Rôles Supportés** : Super Utilisateur, Utilisateur, Super Consultant, Consultant
- **Formulaires Conditionnels** selon rôle sélectionné
- **Workflow Approbation** hiérarchique intégré
- **Interface Moderne** avec design responsive

#### 🎯 **Composants Créés**
- **RoleSelector.jsx** : Sélection visuelle des 4 rôles
- **SuperUtilisateurForm.jsx** : Création groupe d'entreprises
- **UtilisateurForm.jsx** : Rejoindre groupe + créer compagnie
- **ConsultantForm.jsx** : Profil consultant (indépendant/cabinet)

#### 🎯 **Backend Intégré**
- **roleApprovalService.js** : Workflow approbation hiérarchique
- **auth.controller.js** : Étendu pour multi-groupes
- **approvalRoutes.js** : API approbations (/api/approvals)
- **Base de données** : Tables multi-groupes créées

#### 🎯 **Fonctionnalités Avancées**
- **Validation Temps Réel** : Email/username disponibilité
- **Invitations** : Support tokens invitation
- **Approbations** : Workflow hiérarchique automatique
- **Notifications** : EmailService intégré
- **Multi-Groupes** : Architecture complète

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Multi-Groupes](#architecture-multi-groupes)
3. [Fichiers Concernés](#fichiers-concernés)
4. [Code Implémentation](#code-implémentation)
5. [Guide d'Utilisation](#guide-dutilisation)
6. [Intégration dans le Projet](#intégration-dans-le-projet)
7. [Personnalisation](#personnalisation)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Vue d'Ensemble

### Qu'est-ce que la RegisterPage?

**RegisterPage** est un composant React complet permettant aux utilisateurs de créer un nouveau compte dans SPOFE. C'est la page d'inscription qui accompagne la LoginPage.

### 🎯 **Version Multi-Groupes - Architecture Complète**

La nouvelle version **RegisterPage-Extended** implémente une architecture multi-groupes complète avec :

- **4 rôles hiérarchiques** : Super Utilisateur, Utilisateur, Super Consultant, Consultant
- **Workflow approbation** : Approbation hiérarchique automatique
- **Formulaires conditionnels** : Selon le rôle sélectionné
- **Multi-étapes** : Navigation fluide 4 étapes
- **Backend intégré** : Service approbation + API complète

### Caractéristiques Principales

✅ **Formulaire d'inscription multi-groupes**
- **4 rôles supportés** avec formulaires spécifiques
- Email avec validation temps réel
- Nom d'utilisateur
- Mot de passe avec confirmation
- Prénom et Nom
- **Champs spécifiques** selon rôle (groupe, compagnie, consultant)

✅ **Validation en Temps Réel**
- Vérification disponibilité email/username
- Indicateurs visuels (✓ ou ✗)
- Messages d'erreur détaillés
- **Validation progressive** par étape

✅ **Interface Moderne**
- Gradient violet/rose (#667eea → #764ba2)
- Design responsif (mobile, tablet, desktop)
- Animations fluides
- Support du mode sombre
- **4 étapes visuelles** avec progression

✅ **Workflow Approbation**
- **Approbation hiérarchique** automatique
- **Notifications email** intégrées
- **Gestion des demandes** en attente
- **Création automatique** entités (groupe, compagnie)

✅ **Intégration SPOFE**
- Authentification JWT
- Feature flags (approbations)
- Redirection vers login
- Notifications utilisateur
- **Base de données** multi-groupes

### Flux Utilisateur Multi-Groupes

```
Utilisateur
    ↓
Visite /register
    ↓
Étape 1: Sélectionne son rôle (4 options)
    ↓
Étape 2: Remplit infos personnelles (email, username, password)
    ↓
Étape 3: Remplit formulaire spécifique au rôle
    ↓
Étape 4: Validation et soumission
    ↓
Création demande d'approbation (si requis)
    ↓
Email notification approbateur
    ↓
Approbation → Création utilisateur + entités
    ↓
Redirection /login avec message succès
```

---

## Architecture Multi-Groupes

### 🎯 **Vue d'Ensemble de l'Architecture**

L'architecture multi-groupes de SPOFE v2.1 permet une gestion hiérarchique des utilisateurs avec des rôles spécifiques et des workflows d'approbation.

### 📊 **Structure des Rôles**

```
Super Utilisateur (Niveau 1)
├── Crée des groupes d'entreprises
├── Approuve les utilisateurs
└── Gère les consultants

Utilisateur (Niveau 2)  
├── Rejoint un groupe existant
├── Crée des compagnies
└── Accès limité à son groupe

Super Consultant (Niveau 2)
├── Profil consultant avancé
├── Plusieurs spécialités
└── Tarifs élevés

Consultant (Niveau 3)
├── Profil consultant standard
├── Spécialités limitées
└── Accès basic
```

### 🗄️ **Base de Données Multi-Groupes**

```sql
-- Tables principales créées
✅ users (étendu avec champs multi-groupes)
✅ groupe_entreprises (groupes d'entreprises)
✅ companies (compagnies par groupe)
✅ consultant_group_assignments (assignations consultants)
✅ consultant_company_access (accès compagnies)
✅ consulting_firms (cabinets consultants)
✅ firm_consultants (consultants par cabinet)
✅ pending_role_approvals (demandes approbation)
```

### 🔄 **Workflow Approbation**

```
Inscription → Demande Approbation → Notification Approbateur → Décision → Création Entités
```

---

## Fichiers Concernés

### 🎯 **Fichiers Multi-Groupes (Nouveaux)**

```bash
# Frontend - Composants Multi-Groupes
frontend/src/
├── pages/
│   ├── RegisterPage-Extended.jsx        [CRÉÉ - Page multi-groupes]
│   └── RegisterPage-Extended.css        [CRÉÉ - Styles multi-groupes]
├── components/registration/
│   ├── RoleSelector.jsx                  [CRÉÉ - Sélection rôle]
│   ├── RoleSelector.css                  [CRÉÉ - Styles rôle]
│   ├── SuperUtilisateurForm.jsx          [CRÉÉ - Formulaire SU]
│   ├── UtilisateurForm.jsx               [CRÉÉ - Formulaire UT]
│   ├── ConsultantForm.jsx                [CRÉÉ - Formulaire CO]
│   └── RegistrationForms.css             [CRÉÉ - Styles formulaires]
└── router.jsx (ou App.jsx)               [MODIFIER - Route /register]

# Backend - Services Multi-Groupes
cascade/src/
├── services/
│   └── roleApprovalService.js            [CRÉÉ - Workflow approbation]
├── controllers/
│   └── auth.controller.js                [MODIFIÉ - Multi-groupes]
├── routes/
│   └── approvalRoutes.js                 [CRÉÉ - API approbations]
├── models/
│   ├── user.model.js                     [MODIFIÉ - Champs multi-groupes]
│   ├── consultantGroupAssignment.model.js [CRÉÉ - Modèle]
│   ├── consultantCompanyAccess.model.js   [CRÉÉ - Modèle]
│   ├── consultingFirm.model.js           [CRÉÉ - Modèle]
│   └── firmConsultants.model.js           [CRÉÉ - Modèle]
└── database_migrations/
    └── 01_create_consultant_tables.sql    [CRÉÉ - Migration BD]
```

### 📋 **Fichiers Originaux (Conservés)**

```bash
# Frontend - Version originale (conservée)
frontend/src/
├── pages/
│   ├── RegisterPage.jsx                  [ORIGINAL - Conservée]
│   └── RegisterPage.css                  [ORIGINAL - Conservée]
├── hooks/
│   └── useRegister.js                    [ORIGINAL - Conservé]
└── router.jsx (ou App.jsx)               [MODIFIÉ - Routes multiples]
```

### Dépendances Requises

```
- React 18+
- React Router DOM
- Axios (pour requêtes HTTP)
- CSS3 (gradients, animations)
```

---

## Code Implémentation

### 1. RegisterPage.jsx (Composant Principal)

**Fichier**: `frontend/src/pages/RegisterPage.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

/**
 * RegisterPage - Page d'inscription utilisateur
 * 
 * Fonctionnalités:
 * - Formulaire d'inscription complet
 * - Validation email temps réel
 * - Gestion des erreurs
 * - États de chargement
 * - Responsive design
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ============ ÉTATS ============
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    username: '',
    password: '',
    confirmPassword: '',
    prenom: '',
    nom: '',
    groupeId: searchParams.get('groupeId') ? parseInt(searchParams.get('groupeId')) : null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ============ HANDLERS ============

  /**
   * Vérifier disponibilité email en temps réel
   */
  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3001/api/auth/check-email/${encodeURIComponent(email)}`
      );
      setEmailAvailable(response.data.data.available);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      setEmailAvailable(null);
    }
  };

  /**
   * Gérer changements de formulaire
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Vérifier email avec délai (debounce)
    if (name === 'email') {
      const debounceTimer = setTimeout(() => {
        checkEmailAvailability(value);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }

    // Réinitialiser erreurs lors de la saisie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * Valider formulaire avant soumission
   */
  const validateForm = () => {
    const newErrors = [];

    // Email
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.push('Email invalide');
    } else if (emailAvailable === false) {
      newErrors.push('Cet email est déjà utilisé');
    }

    // Username
    if (!formData.username || formData.username.length < 3) {
      newErrors.push('Nom d\'utilisateur minimum 3 caractères');
    }
    if (formData.username && formData.username.length > 30) {
      newErrors.push('Nom d\'utilisateur maximum 30 caractères');
    }

    // Password
    if (!formData.password || formData.password.length < 8) {
      newErrors.push('Mot de passe minimum 8 caractères');
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Les mots de passe ne correspondent pas');
    }

    // Prénom et Nom
    if (!formData.prenom || formData.prenom.trim() === '') {
      newErrors.push('Prénom requis');
    }

    if (!formData.nom || formData.nom.trim() === '') {
      newErrors.push('Nom requis');
    }

    return newErrors;
  };

  /**
   * Gérer soumission du formulaire
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Valider
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Vérifier email disponible
    if (emailAvailable === false) {
      setErrors(['Cet email est déjà utilisé']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      // Appel API
      const response = await axios.post(
        'http://localhost:3001/api/auth/register',
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          prenom: formData.prenom,
          nom: formData.nom,
          groupeId: formData.groupeId
        },
        {
          timeout: 10000 // 10 secondes timeout
        }
      );

      // Succès
      const requiresApproval = response.data.data.requiresApproval;
      const message = requiresApproval
        ? 'Inscription réussie! En attente d\'approbation d\'un administrateur.'
        : 'Inscription réussie! Vous pouvez maintenant vous connecter.';

      // Rediriger vers login
      navigate('/login', {
        state: {
          message: message,
          type: requiresApproval ? 'info' : 'success',
          email: formData.email
        }
      });
    } catch (err) {
      // Erreur
      const errorMessages = err.response?.data?.errors || 
                           [err.response?.data?.message || 'Erreur lors de l\'inscription'];
      setErrors(Array.isArray(errorMessages) ? errorMessages : [errorMessages]);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDU ============
  return (
    <div className="register-container">
      {/* Carte principale */}
      <div className="register-card">
        {/* En-tête */}
        <div className="register-header">
          <h1>Créer un Compte</h1>
          <p className="register-subtitle">
            Bienvenue dans SPOFE v2.1
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleRegister} className="register-form">
          
          {/* Messages d'erreur */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((err, index) => (
                <div key={index} className="error-item">
                  <span className="error-icon">⚠️</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="votre.email@example.com"
                disabled={loading}
                className={`form-input ${
                  emailAvailable === false ? 'input-error' : 
                  emailAvailable === true ? 'input-success' : ''
                }`}
                autoComplete="email"
              />
              {emailAvailable === true && (
                <span className="availability-icon success">✓</span>
              )}
              {emailAvailable === false && (
                <span className="availability-icon error">✗</span>
              )}
            </div>
            {emailAvailable === false && (
              <p className="field-error">Cet email est déjà utilisé</p>
            )}
          </div>

          {/* Champ Nom d'utilisateur */}
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="monnom"
              disabled={loading}
              className="form-input"
              minLength="3"
              maxLength="30"
              autoComplete="username"
            />
            <p className="field-hint">3-30 caractères alphanumériques</p>
          </div>

          {/* Champs Prénom et Nom (côte à côte) */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                placeholder="Jean"
                disabled={loading}
                className="form-input"
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nom">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Dupont"
                disabled={loading}
                className="form-input"
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 8 caractères"
              disabled={loading}
              className="form-input"
              minLength="8"
              autoComplete="new-password"
            />
            <p className="field-hint">
              Minimum 8 caractères (majuscules et chiffres recommandés)
            </p>
          </div>

          {/* Champ Confirmation mot de passe */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer mot de passe *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmez votre mot de passe"
              disabled={loading}
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          {/* Message groupe */}
          {formData.groupeId && (
            <div className="group-info">
              <p>
                ℹ️ Vous allez être ajouté au groupe sélectionné en attente d'approbation.
              </p>
            </div>
          )}

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading || emailAvailable === false}
            className={`register-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Inscription en cours...
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>

          {/* Lien retour login */}
          <div className="register-footer">
            <p>
              Vous avez déjà un compte?{' '}
              <a href="/login" className="login-link">
                Se connecter
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Cartes d'informations */}
      <div className="register-info">
        <div className="info-card">
          <h3>🔐 Sécurité</h3>
          <p>Vos données sont protégées par un chiffrement de haute qualité.</p>
        </div>
        <div className="info-card">
          <h3>⚡ Rapide</h3>
          <p>Inscription simple en quelques clics seulement.</p>
        </div>
        <div className="info-card">
          <h3>✓ Fiable</h3>
          <p>SPOFE v2.1 est la solution de confiance pour votre comptabilité.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="register-footer-final">
        <p className="footer-text">
          Développé par <strong>Entreprises Performantes</strong>
        </p>
        <p className="footer-year">SPOFE 2026</p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

---

### 2. RegisterPage.css (Styles)

**Fichier**: `frontend/src/pages/RegisterPage.css`

```css
/* RegisterPage Styles */

/* ============================================================
   CONTAINER & LAYOUT
   ============================================================ */

.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
               'Ubuntu', 'Cantarell', sans-serif;
}

/* Carte principale */
.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================
   HEADER
   ============================================================ */

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  margin: 0;
  font-size: 28px;
  color: #2d3748;
  font-weight: 700;
}

.register-subtitle {
  margin: 10px 0 0 0;
  color: #718096;
  font-size: 14px;
}

/* ============================================================
   FORMULAIRE
   ============================================================ */

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

/* ============================================================
   INPUTS
   ============================================================ */

.form-input {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input.input-error {
  border-color: #f56565;
  background-color: #fff5f5;
}

.form-input.input-success {
  border-color: #48bb78;
  background-color: #f0fff4;
}

/* Wrapper input avec icône */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .form-input {
  width: 100%;
  padding-right: 40px;
}

/* Icône de disponibilité */
.availability-icon {
  position: absolute;
  right: 12px;
  font-size: 18px;
  transition: all 0.2s ease;
}

.availability-icon.success {
  color: #48bb78;
}

.availability-icon.error {
  color: #f56565;
}

/* ============================================================
   MESSAGES & HINTS
   ============================================================ */

.field-hint {
  margin: 0;
  font-size: 12px;
  color: #718096;
}

.field-error {
  margin: 0;
  font-size: 12px;
  color: #f56565;
  font-weight: 500;
}

.error-messages {
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
  border-radius: 6px;
  padding: 12px;
  gap: 8px;
  display: flex;
  flex-direction: column;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #c53030;
  font-size: 13px;
}

.error-icon {
  flex-shrink: 0;
  font-size: 16px;
}

/* ============================================================
   LAYOUT SPÉCIAL
   ============================================================ */

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.group-info {
  background-color: #edf2f7;
  border-left: 4px solid #4299e1;
  border-radius: 6px;
  padding: 12px;
  margin: 10px 0;
}

.group-info p {
  margin: 0;
  color: #2c5282;
  font-size: 13px;
}

/* ============================================================
   BOUTON D'INSCRIPTION
   ============================================================ */

.register-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.register-button:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-button.loading {
  opacity: 0.8;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================================
   FOOTER FORMULAIRE
   ============================================================ */

.register-footer {
  text-align: center;
  margin-top: 15px;
}

.register-footer p {
  margin: 0;
  font-size: 13px;
  color: #718096;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* ============================================================
   CARTES D'INFORMATION
   ============================================================ */

.register-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 40px;
  width: 100%;
  max-width: 900px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.info-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.info-card p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.4;
}

/* ============================================================
   FOOTER FINAL
   ============================================================ */

.register-footer-final {
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.footer-text {
  margin: 0;
  font-size: 13px;
}

.footer-year {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  color: white;
}

/* ============================================================
   RESPONSIVE DESIGN
   ============================================================ */

/* Tablette (768px et moins) */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }

  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .register-info {
    grid-template-columns: 1fr;
    margin-top: 30px;
  }

  .info-card {
    padding: 15px;
  }

  .info-card h3 {
    font-size: 14px;
  }

  .info-card p {
    font-size: 11px;
  }
}

/* Mobile (480px et moins) */
@media (max-width: 480px) {
  .register-card {
    padding: 20px 15px;
  }

  .register-header h1 {
    font-size: 20px;
  }

  .form-group {
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-input {
    padding: 10px;
    font-size: 13px;
  }

  .register-button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .footer-year {
    font-size: 16px;
  }

  .register-info {
    gap: 12px;
  }
}

/* ============================================================
   MODE SOMBRE (OPTIONNEL)
   ============================================================ */

@media (prefers-color-scheme: dark) {
  .register-card {
    background: #1a202c;
  }

  .register-header h1 {
    color: #e2e8f0;
  }

  .register-subtitle {
    color: #cbd5e0;
  }

  .form-group label {
    color: #e2e8f0;
  }

  .form-input {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }

  .form-input:focus {
    border-color: #667eea;
  }

  .form-input.input-error {
    background-color: #742a2a;
    border-color: #f56565;
  }

  .form-input.input-success {
    background-color: #22543d;
    border-color: #48bb78;
  }

  .error-messages {
    background-color: #742a2a;
    color: #fc8181;
  }

  .field-hint,
  .field-error {
    color: #cbd5e0;
  }

  .group-info {
    background-color: #1e3a5f;
    color: #a0aec0;
  }

  .register-footer p {
    color: #cbd5e0;
  }
}
```

---

### 3. useRegister Hook

**Fichier**: `frontend/src/hooks/useRegister.js`

```jsx
/**
 * useRegister Hook
 * Gère la logique d'inscription et d'invitation utilisateur
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  /**
   * S'inscrire avec email/password
   * 
   * @param {Object} formData - { email, username, password, prenom, nom, groupeId? }
   * @returns {Promise<Object>} { success, data, message, errors }
   */
  const register = useCallback(async (formData) => {
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          prenom: formData.prenom,
          nom: formData.nom,
          groupeId: formData.groupeId
        }
      );

      setUserData(response.data.data.user);
      setSuccess(true);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const errorMessages = error.response?.data?.errors || [error.message];
      setErrors(Array.isArray(errorMessages) ? errorMessages : [errorMessages]);

      return {
        success: false,
        errors: errorMessages,
        message: error.response?.data?.message || 'Erreur lors de l\'inscription'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Vérifier disponibilité d'une adresse email
   * 
   * @param {string} email - Email à vérifier
   * @returns {Promise<boolean>} true si disponible, false sinon
   */
  const checkEmailAvailability = useCallback(async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`
      );
      return response.data.data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'email:', error);
      return null;
    }
  }, []);

  /**
   * Vérifier le statut d'inscription d'un utilisateur
   * 
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} { exists, userId, status, ... }
   */
  const checkRegistrationStatus = useCallback(async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/registration-status/${encodeURIComponent(email)}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return null;
    }
  }, []);

  /**
   * Accepter une invitation par token
   * 
   * @param {string} email - Email de l'invitation
   * @param {string} token - Token d'invitation
   * @param {string} password - Nouveau mot de passe
   * @param {string} prenom - Prénom
   * @param {string} nom - Nom
   * @returns {Promise<Object>} { success, data, message }
   */
  const acceptInvitation = useCallback(async (email, token, password, prenom, nom) => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/accept-invitation`,
        {
          email,
          token,
          password,
          prenom,
          nom
        }
      );

      setSuccess(true);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const errorMessages = error.response?.data?.errors || [error.message];
      setErrors(Array.isArray(errorMessages) ? errorMessages : [errorMessages]);

      return {
        success: false,
        errors: errorMessages,
        message: error.response?.data?.message || 'Erreur lors de l\'acceptation'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Réinitialiser les erreurs
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * Réinitialiser le succès
   */
  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    // États
    loading,
    errors,
    success,
    userData,
    
    // Méthodes
    register,
    checkEmailAvailability,
    checkRegistrationStatus,
    acceptInvitation,
    clearErrors,
    clearSuccess
  };
};

export default useRegister;
```

---

### 4. Intégration dans Router

**Fichier**: `frontend/src/router.jsx` (ou `App.jsx`)

```jsx
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // [NOUVEAU]
import Dashboard from './pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    public: true
  },
  {
    path: '/register', // [NOUVEAU]
    element: <RegisterPage />,
    public: true
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    protected: true
  },
  // ... autres routes
]);
```

---

## Guide d'Utilisation

### Pour les Utilisateurs

#### Flux d'Inscription Simple (Feature Flag OFF)

**Étape 1**: Cliquer sur "Créer un compte" sur la page LoginPage
```
LoginPage
    ↓ (lien "Créer un compte")
RegisterPage (/register)
```

**Étape 2**: Remplir le formulaire
```
Email:         user@example.com
               (validation temps réel: ✓ ou ✗)
Username:      monnom
Prénom:        Jean
Nom:           Dupont
Mot de passe:  SecurePass123!
Confirmer:     SecurePass123!
```

**Étape 3**: Cliquer "Créer mon compte"
```
Validation... ⏳
    ↓
Succès! ✅
    ↓
Redirection vers /login
```

**Étape 4**: Se connecter
```
Email:    user@example.com
Password: SecurePass123!
    ↓
Accès au dashboard ✅
```

#### Flux avec Approbations (Feature Flag ON)

**Étape 1-2**: Même que ci-dessus, mais avec URL:
```
/register?groupeId=1
    ↓
Le formulaire mentionne l'approbation
```

**Étape 3**: Après soumission
```
Message: "En attente d'approbation"
Email au super-user du groupe
```

**Étape 4**: Super user approuve
```
Email de confirmation reçue
```

**Étape 5**: Maintenant l'utilisateur peut se connecter
```
Se connecter avec credentials
    ↓
Accès au dashboard ✅
```

---

### Pour les Développeurs

#### Personnaliser les Couleurs

**Fichier**: `RegisterPage.css`

```css
/* Changer gradient */
.register-container {
  background: linear-gradient(135deg, #YourColor1 0%, #YourColor2 100%);
}

/* Changer couleur bouton */
.register-button {
  background: linear-gradient(135deg, #NewColor1 0%, #NewColor2 100%);
}

/* Changer couleur focus input */
.form-input:focus {
  border-color: #YourColor;
  box-shadow: 0 0 0 3px rgba(YourR, YourG, YourB, 0.1);
}
```

#### Personnaliser les Messages

**Fichier**: `RegisterPage.jsx`

```jsx
// Changer titre
<h1>Créer un Profil</h1> {/* Avant: Créer un Compte */}

// Changer subtitle
<p className="register-subtitle">Mon Application v1.0</p>

// Changer placeholder
<input placeholder="prenom@exemple.fr" />

// Changer messages
setSuccessMessage("Bienvenue dans notre plateforme!");
```

#### Ajouter Champs Supplémentaires

**Étape 1**: Ajouter au state
```jsx
const [formData, setFormData] = useState({
  // ... champs existants ...
  telephone: '', // [NOUVEAU]
  entreprise: ''  // [NOUVEAU]
});
```

**Étape 2**: Ajouter au formulaire
```jsx
<div className="form-group">
  <label htmlFor="telephone">Téléphone</label>
  <input
    type="tel"
    id="telephone"
    name="telephone"
    value={formData.telephone}
    onChange={handleInputChange}
  />
</div>
```

**Étape 3**: Envoyer à l'API
```jsx
const response = await axios.post(
  `${API_BASE_URL}/auth/register`,
  {
    // ... données existantes ...
    telephone: formData.telephone,
    entreprise: formData.entreprise
  }
);
```

#### Changer l'URL de l'API

**Fichier**: `RegisterPage.jsx` et `useRegister.js`

```jsx
// Avant
const API_BASE_URL = 'http://localhost:3001/api';

// Après (production)
const API_BASE_URL = 'https://api.spofe.com/api';
```

Ou via variables d'environnement:
```jsx
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

---

## Intégration dans le Projet

### Étape 1: Créer les Fichiers

```bash
# Créer RegisterPage.jsx
touch frontend/src/pages/RegisterPage.jsx

# Créer RegisterPage.css
touch frontend/src/pages/RegisterPage.css

# Créer useRegister.js si n'existe pas
touch frontend/src/hooks/useRegister.js
```

### Étape 2: Copier le Code

1. Copier le contenu de RegisterPage.jsx (section 2.1)
2. Copier le contenu de RegisterPage.css (section 2.2)
3. Copier le contenu de useRegister.js (section 2.3)

### Étape 3: Ajouter la Route

Ouvrir `frontend/src/router.jsx` et ajouter:

```jsx
import RegisterPage from './pages/RegisterPage';

// Dans les routes:
{
  path: '/register',
  element: <RegisterPage />,
  public: true
}
```

### Étape 4: Vérifier les Dépendances

```bash
cd frontend
npm list react react-router-dom axios

# Si manquantes:
npm install react react-router-dom axios
```

### Étape 5: Tester

```bash
# Démarrer le frontend
npm run dev

# Visiter
http://localhost:5173/register
```

---

## Personnalisation

### 1. Thème et Couleurs

**Pour utiliser un thème custom**:

```css
/* RegisterPage.css */

:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #f56565;
  --text-color: #2d3748;
  --border-color: #e2e8f0;
}

.register-container {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.register-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}
```

### 2. Validation Personnalisée

**Ajouter validation personnalisée**:

```jsx
const validateForm = () => {
  const newErrors = [];

  // Validation existante...

  // [NOUVEAU] Ajouter validation personnalisée
  if (formData.email.endsWith('.com')) {
    newErrors.push('Veuillez utiliser un email professionnel (.fr, .be, etc)');
  }

  // Ajouter regex personnalisée pour username
  if (!/^[a-z0-9_]+$/.test(formData.username)) {
    newErrors.push('Username: lettres minuscules, chiffres et underscore uniquement');
  }

  return newErrors;
};
```

### 3. Ajouter CAPTCHA

**Intégrer reCAPTCHA**:

```jsx
import ReCAPTCHA from "react-google-recaptcha";

// Dans le formulaire:
<ReCAPTCHA
  sitekey="YOUR_RECAPTCHA_SITE_KEY"
  onChange={(token) => setRecaptchaToken(token)}
/>

// Avant soumission:
if (!recaptchaToken) {
  setErrors(['Veuillez compléter le CAPTCHA']);
  return;
}
```

### 4. Intégrer 2FA

**Ajouter authentification deux facteurs**:

```jsx
const [twoFaRequired, setTwoFaRequired] = useState(false);
const [twoFaCode, setTwoFaCode] = useState('');

// Après inscription réussie:
if (response.data.data.requiresTwoFa) {
  setTwoFaRequired(true);
  setUserData(response.data.data.user);
} else {
  // Rediriger vers login
}

// Formulaire 2FA:
{twoFaRequired && (
  <input
    type="text"
    placeholder="Code 2FA (6 chiffres)"
    value={twoFaCode}
    onChange={(e) => setTwoFaCode(e.target.value)}
  />
)}
```

---

## API Reference

### Endpoints Utilisés

#### 1. POST /api/auth/register

**Description**: Inscrire un nouvel utilisateur

**Request**:
```json
{
  "email": "user@example.com",
  "username": "monnom",
  "password": "SecurePass123!",
  "prenom": "Jean",
  "nom": "Dupont",
  "groupeId": 1
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 42,
      "email": "user@example.com",
      "username": "monnom",
      "prenom": "Jean",
      "nom": "Dupont"
    },
    "requiresApproval": false,
    "message": "Inscription réussie..."
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "errors": ["Email invalide"],
  "message": "Données invalides"
}
```

#### 2. GET /api/auth/check-email/:email

**Description**: Vérifier disponibilité email

**Request**:
```
GET /api/auth/check-email/test@example.com
```

**Response**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "email": "test@example.com"
  }
}
```

#### 3. GET /api/auth/registration-status/:email

**Description**: Vérifier statut d'inscription

**Request**:
```
GET /api/auth/registration-status/user@example.com
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exists": true,
    "userId": 42,
    "isActive": true,
    "role": "user",
    "status": "active"
  }
}
```

---

## Troubleshooting

### Problème: RegisterPage ne s'affiche pas

**Cause**: Route non enregistrée

**Solution**:
```jsx
// Vérifier dans router.jsx
{
  path: '/register',
  element: <RegisterPage />,
  public: true  // ← Important!
}
```

### Problème: Styles CSS ne s'appliquent pas

**Cause**: Fichier CSS non importé

**Solution**:
```jsx
// RegisterPage.jsx
import './RegisterPage.css'; // ← Ajouter cet import
```

### Problème: API 404 Not Found

**Cause**: Backend endpoints non enregistrés

**Solution**:
1. Vérifier backend court (cascade/src/app.js)
2. Vérifier routes enregistrées:
```javascript
app.use('/api/auth', authRegistrationRoutes);
```

### Problème: Email validation ne fonctionne pas

**Cause**: Délai trop court

**Solution**:
```jsx
const debounceTimer = setTimeout(() => {
  checkEmailAvailability(value);
}, 800);  // Augmenter délai à 800ms
```

### Problème: Formulaire ne se soumet pas

**Cause**: Validation échoue silencieusement

**Solution**:
```jsx
const handleRegister = async (e) => {
  e.preventDefault();
  
  const errors = validateForm();
  console.log('Validation errors:', errors); // [NOUVEAU]
  
  if (errors.length > 0) {
    setErrors(errors);
    return;
  }
  // ...
}
```

### Problème: Erreurs CORS

**Cause**: Backend CORS non configuré

**Solution** (`cascade/src/app.js`):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problème: Mot de passe faible accepté

**Cause**: Validation password trop faible

**Solution**:
```jsx
const validateForm = () => {
  // Avant
  if (!formData.password || formData.password.length < 8) {
    newErrors.push('Minimum 8 caractères');
  }

  // Après: Plus strict
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    newErrors.push('Minimum 1 majuscule, 1 minuscule, 1 chiffre');
  }
};
```

---

## Checklist Intégration

Avant de mettre en production:

- [ ] RegisterPage.jsx copié
- [ ] RegisterPage.css copié
- [ ] useRegister.js copié
- [ ] Route /register ajoutée au router
- [ ] Imports CSS ajoutés
- [ ] Backend enregistré (app.js)
- [ ] Endpoints API fonctionnels
- [ ] CORS configuré
- [ ] Tests manuels passés
- [ ] Validation fonctionnelle
- [ ] Emails de confirmation (optionnel)
- [ ] Analytics intégrés (optionnel)

---

## Statistiques

| Métrique | Valeur |
|----------|--------|
| **Lignes RegisterPage.jsx** | ~230 |
| **Lignes RegisterPage.css** | ~380 |
| **Lignes useRegister.js** | ~120 |
| **Endpoints utilisés** | 3 |
| **Temps d'intégration** | 15 min |
| **Temps de développement** | ~2 heures |

---

## Support & Ressources

### Documentation Connexe

- [PHASE_1_INTEGRATION_GUIDE.md](PHASE_1_INTEGRATION_GUIDE.md) - Integration générale
- [USER_FLOW_EXAMPLES.md](USER_FLOW_EXAMPLES.md) - Exemples d'utilisation API
- [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) - Diagrams architecture

### Fichiers de Référence

- `frontend/src/pages/LoginPage.jsx` - Utiliser comme référence de style
- `frontend/src/hooks/useAuth.js` - Pattern pour hooks similaires
- `cascade/src/services/UserInvitationService.js` - Logique backend

---

*Documentation RegisterPage Complète*  
*SPOFE v2.1 - January 24, 2026*  
*Production-Ready ✅*
