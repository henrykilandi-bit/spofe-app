# 📋 Tableau de Correspondance - RegisterPage-Extended vs Base de Données

## 🎯 Vue d'ensemble
Ce document mappe chaque champ du formulaire d'inscription (`RegisterPage-Extended.jsx`) avec ses colonnes correspondantes dans la table `users` de la base de données XAMPP.

---

## 📊 TABLEAU DE CORRESPONDANCE COMPLET

| # | Section | Champ Frontend | Type | Colonne BD | Type BD | Obligatoire? | Notes |
|---|---------|---|---|---|---|---|---|
| **ÉTAPE 1: INFORMATIONS DE BASE** |
| 1 | Emails | `email` | string | `email` | VARCHAR(255) | ✅ OUI | Unique, format email requis |
| 2 | Identifiants | `username` | string | `username` | VARCHAR(255) | ✅ OUI | Unique, 3-30 caractères |
| 3 | Mot de passe | `password` | string | `password` | VARCHAR(255) | ✅ OUI | Hashé avec bcrypt, critères: min 8 chars, 1 maj, 1 min, 1 chiffre, 1 spécial |
| 4 | Confirmation MDP | `confirmPassword` | string | ❌ N/A | - | ✅ OUI | Validation frontend uniquement |
| 5 | Prénom | `prenom` | string | `prenom` | VARCHAR(100) | ⚠️ NON | Facultatif, max 100 chars |
| 6 | Nom | `nom` | string | `nom` | VARCHAR(100) | ⚠️ NON | Facultatif, max 100 chars |
| 7 | Téléphone | `telephone` | string | `telephone` | VARCHAR(20) | ⚠️ NON | Format: +243815170980 |
| **ÉTAPE 2: RÔLE** |
| 8 | Rôle | `role` | enum | `role` | ENUM('admin', 'super_utilisateur', 'utilisateur', 'super_consultant', 'consultant', 'viewer', 'accountant') | ✅ OUI | Défaut: 'utilisateur' |
| **ÉTAPE 3: CHAMPS SPÉCIFIQUES AU RÔLE** |
| **Pour: SUPER_UTILISATEUR** |
| 9 | Groupe | `groupeName` | string | ❌ N/A (table groupes_entreprises) | - | ✅ OUI | Crée un nouveau groupe |
| 10 | Groupe | `groupeDescription` | string | ❌ N/A (table groupes_entreprises) | - | ⚠️ NON | Description du groupe |
| 11 | Groupe | `groupeSiret` | string | ❌ N/A | - | ⚠️ NON | Format RCCM: CD/RCCM/MAT/15-A-5469 |
| 12 | Groupe | `groupeAdresse` | string | ❌ N/A | - | ⚠️ NON | Adresse du groupe |
| 13 | Groupe | `groupeEmail` | string | ❌ N/A | - | ⚠️ NON | Email du groupe |
| 14 | Groupe | `groupeTelephone` | string | ❌ N/A | - | ⚠️ NON | Téléphone du groupe |
| 15 | Groupe | `groupeWebsite` | string | ❌ N/A | - | ⚠️ NON | Site web du groupe |
| **Pour: UTILISATEUR** |
| 16 | Groupe | `groupeId` | integer | `groupe_id` | INT | ✅ OUI | ID du groupe existant |
| 17 | Groupe | `groupeName` | string | ❌ N/A | - | ⚠️ NON | Nom du groupe (affichage) |
| 18 | Entreprise | `compagnieName` | string | ❌ N/A (table companies) | - | ✅ OUI | Crée une nouvelle entreprise |
| 19 | Entreprise | `compagnieSiret` | string | ❌ N/A | - | ✅ OUI | 14 chiffres uniquement |
| 20 | Entreprise | `compagnieDescription` | string | ❌ N/A | - | ⚠️ NON | Description de l'entreprise |
| 21 | Entreprise | `compagnieEmail` | string | ❌ N/A | - | ⚠️ NON | Email de l'entreprise |
| 22 | Entreprise | `compagnieTelephone` | string | ❌ N/A | - | ⚠️ NON | Téléphone de l'entreprise |
| 23 | Entreprise | `compagnieAdresse` | string | ❌ N/A | - | ⚠️ NON | Adresse de l'entreprise |
| 24 | Entreprise | `compagnieWebsite` | string | ❌ N/A | - | ⚠️ NON | Site web de l'entreprise |
| **Pour: CONSULTANT / SUPER_CONSULTANT** |
| 25 | Type | `registrationType` | enum | ❌ N/A | - | ⚠️ NON | 'independent' ou 'firm' |
| 26 | Spécialités | `specialites` | array | `specialites` | JSON | ✅ OUI | Ex: ["audit", "fiscalité"] |
| 27 | Tarif | `tarifHoraire` | decimal | `tarif_horaire` | DECIMAL(10,2) | ✅ OUI | En FCFA, > 0 |
| 28 | Expérience | `experienceYears` | integer | `experience_years` | INT | ✅ OUI | 0-50 ans |
| 29 | SIRET | `siret` | string | `siret` | VARCHAR(14) | ⚠️ NON | 14 chiffres uniquement |
| 30 | Contrats | `contractTypes` | array | ❌ N/A | - | ⚠️ NON | Types de contrats |
| 31 | Type Entreprise | `firmType` | string | ❌ N/A | - | ⚠️ NON | Type de cabinet/entreprise |
| 32 | Entreprise | `firmName` | string | ❌ N/A | - | ⚠️ NON | Nom de l'entreprise/cabinet |
| 33 | Entreprise | `firmSiret` | string | ❌ N/A | - | ⚠️ NON | SIRET de l'entreprise |
| 34 | Entreprise | `firmDescription` | string | ❌ N/A | - | ⚠️ NON | Description de l'entreprise |
| **INVITATION** |
| 35 | Invitation | `invitationToken` | string | `invitation_token` | VARCHAR(255) | ⚠️ NON | Token d'invitation si applicable |
| **CHAMPS AUTOMATIQUES (non visibles)** |
| 36 | Système | ❌ N/A | ❌ N/A | `id` | INT (auto-increment) | ✅ OUI | Clé primaire |
| 37 | Système | ❌ N/A | ❌ N/A | `group_id` | INT | ⚠️ NON | FK vers groupes_entreprises (depuis ligne 16) |
| 38 | Système | ❌ N/A | ❌ N/A | `is_active` | TINYINT(1) | ✅ OUI | Défaut: 1 (TRUE) |
| 39 | Système | ❌ N/A | ❌ N/A | `created_at` | DATETIME | ✅ OUI | Timestamp création |
| 40 | Système | ❌ N/A | ❌ N/A | `updated_at` | DATETIME | ✅ OUI | Timestamp modification |
| 41 | Système | ❌ N/A | ❌ N/A | `deleted_at` | DATETIME | ⚠️ NON | Soft delete (paranoid) |
| 42 | Système | ❌ N/A | ❌ N/A | `hierarchy_level` | INT | ✅ OUI | Calculé auto selon rôle |
| 43 | Système | ❌ N/A | ❌ N/A | `can_grant_permissions` | TINYINT(1) | ✅ OUI | Calculé auto selon rôle |

---

## 🔍 LÉGENDE

| Symbole | Signification |
|---------|---|
| ✅ OUI | Champ obligatoire |
| ⚠️ NON | Champ facultatif/optionnel |
| ❌ N/A | Non stocké dans la table users |
| camelCase | Nom du champ en frontend |
| snake_case | Nom de la colonne en base de données (Sequelize avec `underscored: true`) |

---

## 📍 POINTS IMPORTANTS

### 1. **Champs stockés dans d'autres tables**
- `groupeName`, `groupeDescription`, etc. → Table `groupes_entreprises` (créée au moment de l'inscription)
- `compagnieName`, `compagnieSiret`, etc. → Table `companies` (créée au moment de l'inscription)
- `contractTypes` → Potentiellement une table de liaison ou JSON

### 2. **Conversion de noms (camelCase → snake_case)**
Grâce à `underscored: true` dans le modèle Sequelize:
```
Frontend: groupeId      →  BD: groupe_id
Frontend: tarifHoraire  →  BD: tarif_horaire
Frontend: specialites   →  BD: specialites
Frontend: invitationToken → BD: invitation_token
```

### 3. **Colonnes DOUBLONS en BD**
⚠️ **ATTENTION**: Il existe actuellement des colonnes en doublon:
- `groupe_id` (snake_case, CORRECT) ET `groupeId` (camelCase, ANCIEN)
- `invitation_token` (snake_case, CORRECT) ET `invitationToken` (camelCase, ANCIEN)

**Solution**: Les vieilles colonnes camelCase doivent être supprimées après vérification.

### 4. **Champs calculés automatiquement**
Ces champs sont remplis par le backend:
- `hierarchy_level`: Défini selon le `role` via un hook Sequelize
- `can_grant_permissions`: TRUE pour admin, super_utilisateur, utilisateur
- `is_active`: TRUE par défaut
- `created_at`, `updated_at`: Timestamps automatiques

### 5. **Validation des données**

**Champs avec validations strictes**:
- `email`: Format email + unique
- `username`: 3-30 chars + unique
- `password`: Min 8 chars, majuscule, minuscule, chiffre, caractère spécial
- `telephone`: Format international
- `siret` (consultant): Exactement 14 chiffres
- `compagnieSiret`: Exactement 14 chiffres

---

## 🔄 FLUX DE DONNÉES

### Lors de l'inscription d'un Super Utilisateur:
```
FormData (Frontend)
    ↓
Validation Frontend (RegisterPage-Extended.jsx)
    ↓
POST /api/auth/register
    ↓
Backend (auth.controller.js)
    ├─ Crée user dans table 'users'
    ├─ Crée groupe dans table 'groupes_entreprises'
    └─ Lie l'user au groupe via 'groupe_id'
```

### Lors de l'inscription d'un Utilisateur (régulier):
```
FormData (Frontend)
    ↓
Validation Frontend
    ↓
POST /api/auth/register
    ↓
Backend
    ├─ Crée user dans table 'users' avec groupe_id existant
    ├─ Crée entreprise dans table 'companies'
    └─ Lie l'user à l'entreprise
```

### Lors de l'inscription d'un Consultant:
```
FormData (Frontend)
    ↓
Validation Frontend
    ↓
POST /api/auth/register
    ↓
Backend
    ├─ Crée user dans table 'users'
    ├─ Stocke specialites (JSON)
    ├─ Stocke tarif_horaire
    └─ Stocke experience_years
```

---

## ✅ CHECKLIST POUR DÉBOGUER

Si un champ n'est pas sauvegardé:
1. ☑ Vérifier que le champ existe dans `formData` (RegisterPage-Extended.jsx ligne 55-108)
2. ☑ Vérifier que le champ est inclus dans le `payload` (RegisterPage-Extended.jsx ligne 555-600)
3. ☑ Vérifier que le champ est destructuré dans `register()` (auth.controller.js ligne 35-75)
4. ☑ Vérifier que le champ est passé à `User.create()` (auth.controller.js ligne 160-172)
5. ☑ Vérifier que la colonne existe en BD avec le bon nom (snake_case)
6. ☑ Vérifier que le modèle Sequelize définit le champ (user.model.js)

---

## 📌 RÉSUMÉ RAPIDE

**Champs qui vont directement en BD (table users)**:
- ✅ email, username, password, role
- ✅ prenom, nom, telephone
- ✅ specialites, tarif_horaire, experience_years, siret
- ✅ groupe_id, invitation_token
- ✅ is_active, created_at, updated_at, deleted_at

**Champs créés dans d'autres tables**:
- 📦 groupeName → groupes_entreprises.nom
- 📦 compagnieName → companies.name
- 📦 contractTypes → ? (à clarifier)

**Champs calculés automatiquement**:
- 🔄 hierarchy_level, can_grant_permissions

---

*Dernière mise à jour: 25 janvier 2026*
