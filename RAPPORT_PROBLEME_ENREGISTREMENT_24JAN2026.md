# 🔴 RAPPORT D'ANALYSE - Problème d'Enregistrement (Créer mon compte)
**Date:** 24 Janvier 2026  
**Status:** 🔴 CRITIQUE - Enregistrement ne fonctionne PAS  
**Severité:** HAUTE

---

## 📋 RÉSUMÉ EXÉCUTIF

Le bouton "Créer mon compte" sur la page d'enregistrement **NE FONCTIONNE PAS** car il existe une **incompatibilité majeure entre le format des données envoyées par le frontend et celles acceptées par le backend**. De plus, le contrôleur d'enregistrement a une **logique incomplète** pour certains rôles.

---

## 🔍 ANALYSE DÉTAILLÉE DES PROBLÈMES

### ❌ PROBLÈME 1: INCOMPATIBILITÉ DES NOMS DE CHAMPS (Frontend vs Backend)

**Localisation:**
- Frontend: [frontend/src/pages/RegisterPage.jsx](frontend/src/pages/RegisterPage.jsx#L722-L800)
- Backend: [cascade/src/controllers/auth.controller.minimal.js](cascade/src/controllers/auth.controller.minimal.js#L20-L40)

**Le Problème:**

Le frontend envoie les données en **camelCase** mais le backend (auth.controller.minimal.js) s'attend à du **snake_case** pour certains champs:

| Frontend (Envoyé) | Backend (Attendu) | Statut |
|---|---|---|
| `tarifHoraire` | `tarif_horaire` | ❌ INCOMPATIBLE |
| `experienceYears` | `experience_years` | ❌ INCOMPATIBLE |
| `typeConsultant` | `type_consultant` | ❌ INCOMPATIBLE |
| `specialites` | `specialites` | ✅ OK |

**Impact:** Quand un consultant s'inscrit, les champs `tarif_horaire` et `experience_years` ne sont **PAS REÇUS** correctement par le backend, ce qui peut causer des erreurs ou des données manquantes.

**Code Problématique (Frontend):**
```jsx
// frontend/src/pages/RegisterPage.jsx - ligne 722-800
const payload = {
  // ...
  ...(formData.role === 'consultant' && {
    adresse: formData.adresse || null,
    pays: formData.pays || null,
    specialites: formData.specialites || null,
    tarif_horaire: parseFloat(formData.tarif_horaire) || null,  // ❌ camelCase
    experience_years: formData.experience_years ? parseInt(formData.experience_years) : null  // ❌ camelCase
  }),
  // ...
};
```

**Code du Backend:**
```javascript
// cascade/src/controllers/auth.controller.minimal.js - ligne 32-37
const { 
  // ...
  tarif_horaire,      // ✅ Attend tarif_horaire
  experience_years,   // ✅ Attend experience_years
  type_consultant,    // ✅ Attend type_consultant
} = req.body;
```

---

### ❌ PROBLÈME 2: CHAMPS MANQUANTS POUR LES RÔLES SUPER_UTILISATEUR ET UTILISATEUR

**Localisation:**
- Frontend: [frontend/src/pages/RegisterPage-Extended.jsx](frontend/src/pages/RegisterPage-Extended.jsx#L478-L560)
- Backend: [cascade/src/controllers/auth.controller.js](cascade/src/controllers/auth.controller.js#L30-L150)

**Le Problème:**

La version `RegisterPage-Extended.jsx` envoie des données pour les rôles **`super_utilisateur`** et **`utilisateur`** avec des champs comme `groupeName`, `compagnieName`, etc., **MAIS** le `auth.controller.minimal.js` (celui utilisé dans app.js) **N'ACCEPTE PAS CES CHAMPS**.

**Champs non gérés par le backend minimal:**
- `groupeName` / `groupeDescription` / `groupeSiret` / `groupeAdresse`
- `compagnieName` / `compagnieSiret` / `compagnieDescription`
- Et autres champs multi-groupes

**Impact:** Les utilisateurs qui s'inscrivent avec le rôle "super_utilisateur" ou "utilisateur" perdront toutes leurs données supplémentaires car le backend les ignore silencieusement.

---

### ❌ PROBLÈME 3: DEUX VERSIONS DE REGISTERPAGE EN CONCURRENCE

**Localisation:**
- [frontend/src/pages/RegisterPage.jsx](frontend/src/pages/RegisterPage.jsx) - VERSION PRINCIPALE
- [frontend/src/pages/RegisterPage-Extended.jsx](frontend/src/pages/RegisterPage-Extended.jsx) - VERSION ALTERNATIVE
- [cascade/src/routes/auth.routes.js](cascade/src/routes/auth.routes.js#L1-L50) - ROUTES COMPLÈTES
- [cascade/src/routes/auth.routes.minimal.js](cascade/src/routes/auth.routes.minimal.js) - ROUTES MINIMALES

**Le Problème:**

Il existe **2 versions complètes** du formulaire d'enregistrement:
1. `RegisterPage.jsx` - Envoie les données avec champs consultants uniquement
2. `RegisterPage-Extended.jsx` - Envoie les données avec support multi-groupes (rôles super_utilisateur, utilisateur, consultant)

Et **2 versions du backend**:
1. `auth.controller.minimal.js` + `auth.routes.minimal.js` - **UTILISÉE ACTUELLEMENT** ⚠️
2. `auth.controller.js` + `auth.routes.js` - **NON UTILISÉE**

**Code dans app.js (Problème!):**
```javascript
// cascade/src/app.js - ligne 4
import authRoutes from './routes/auth.routes.minimal.js';  // ❌ VERSION MINIMALE UNIQUEMENT

// Devrait être:
// import authRoutes from './routes/auth.routes.js';  // ✅ VERSION COMPLÈTE
```

**Impact:** Le backend complet avec support `RoleApprovalService` n'est **JAMAIS UTILISÉ**. Seule la version minimale sans approvals est active.

---

### ❌ PROBLÈME 4: APP.JS UTILISE UNE VERSION DE TEST

**Localisation:**
[cascade/src/app.js](cascade/src/app.js#L1-L10)

**Commentaire dans le code:**
```javascript
// src/app.js - VERSION MINIMALE POUR TEST INSCRIPTION
```

Le fichier `app.js` est configuré en **mode TEST** avec seulement la route minimale, ce qui explique pourquoi les fonctionnalités avancées ne fonctionnent pas.

---

## 📊 TABLEAU RÉCAPITULATIF DES PROBLÈMES

| # | Problème | Sévérité | Fichiers Affectés | Solution |
|---|----------|----------|---|---|
| 1 | Incompatibilité camelCase/snake_case | 🔴 HAUTE | RegisterPage.jsx + auth.controller.minimal.js | Normaliser les noms de champs |
| 2 | Champs multi-groupes ignorés | 🔴 HAUTE | RegisterPage-Extended.jsx + auth.controller.minimal.js | Utiliser auth.controller.js complet |
| 3 | Deux versions en concurrence | 🟠 MOYENNE | Frontend + Backend routes | Supprimer les versions alternatives |
| 4 | app.js en mode TEST | 🔴 HAUTE | cascade/src/app.js | Passer à la version de production |

---

## 🛠️ SOLUTIONS RECOMMANDÉES

### Solution Rapide (30 min) - RECOMMANDÉE
**Objectif:** Faire fonctionner l'enregistrement avec les données présentes

1. **Modifier app.js** pour utiliser les routes complètes:
```javascript
// cascade/src/app.js
import authRoutes from './routes/auth.routes.js';  // ✅ COMPLET
```

2. **Vérifier que auth.controller.js** exporte la fonction `register` correctement et gère les données camelCase

3. **Tester l'enregistrement** via RegisterPage.jsx

### Solution Complète (2h) - À FAIRE APRÈS
**Objectif:** Supporter tous les rôles avec all les données

1. Nettoyer les fichiers redondants:
   - Supprimer `auth.controller.minimal.js`
   - Supprimer `auth.routes.minimal.js`
   - Supprimer `RegisterPage-OLD.jsx`, `RegisterPage-BACKUP.jsx`, `RegisterPage-NEW.jsx`

2. Vérifier que `auth.controller.js` gère les formats camelCase ET snake_case:
```javascript
// Normaliser les entrées
const normalizeConsultantFields = (data) => ({
  ...data,
  tarif_horaire: data.tarifHoraire || data.tarif_horaire,
  experience_years: data.experienceYears || data.experience_years,
  type_consultant: data.typeConsultant || data.type_consultant,
});
```

3. Activer le support des approbations via `RoleApprovalService`

---

## 📝 FICHIERS À VÉRIFIER / MODIFIER

### Frontend
- ✅ [RegisterPage.jsx](frontend/src/pages/RegisterPage.jsx) - Envoie données en snake_case pour consultants
- ✅ [RegisterPage-Extended.jsx](frontend/src/pages/RegisterPage-Extended.jsx) - Envoie données en camelCase pour tous les rôles

### Backend
- ❌ [cascade/src/app.js](cascade/src/app.js) - **À MODIFIER** - Utilise routes minimales
- ⚠️ [cascade/src/controllers/auth.controller.minimal.js](cascade/src/controllers/auth.controller.minimal.js) - Incomplet
- ✅ [cascade/src/controllers/auth.controller.js](cascade/src/controllers/auth.controller.js) - Version complète, non utilisée
- ⚠️ [cascade/src/routes/auth.routes.minimal.js](cascade/src/routes/auth.routes.minimal.js) - Minimale
- ✅ [cascade/src/routes/auth.routes.js](cascade/src/routes/auth.routes.js) - Complète, non utilisée

---

## 🧪 TEST DE VÉRIFICATION

Pour tester l'enregistrement actuellement:

1. **Via RegisterPage.jsx** (rôle consultant):
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "prenom": "Jean",
    "nom": "Dupont",
    "role": "consultant",
    "tarif_horaire": 50000,
    "experience_years": 5
  }'
```

2. **Via RegisterPage-Extended.jsx** (rôle super_utilisateur):
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super@example.com",
    "username": "superuser",
    "password": "Password123!",
    "prenom": "Marie",
    "nom": "Martin",
    "role": "super_utilisateur",
    "groupeName": "Groupe ABC"
  }'
```

---

## 💡 CONCLUSIONS

**Pourquoi le bouton "Créer mon compte" ne fonctionne pas:**

1. ✅ Le formulaire envoie les données correctement
2. ✅ Le endpoint `/api/auth/register` existe
3. ❌ **MAIS** Le backend utilisé (auth.controller.minimal.js) est incomplet et ne gère pas tous les rôles
4. ❌ **ET** Il y a une incompatibilité de format de noms de champs (camelCase vs snake_case)
5. ❌ **ET** app.js utilise la version de TEST au lieu de la version de PRODUCTION

**Le problème principal: app.js utilise les routes minimales au lieu des routes complètes**

---

**Rapport généré le:** 24 Janvier 2026  
**Analysé par:** GitHub Copilot
