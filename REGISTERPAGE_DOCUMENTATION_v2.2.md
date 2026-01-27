# Documentation RegisterPage v2.2 - SPOFE Application

**Date**: 24 janvier 2026  
**Version**: 2.2  
**Statut**: En production

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture et structure](#architecture-et-structure)
3. [Champs de formulaire](#champs-de-formulaire)
4. [Systèmes de rôles](#systèmes-de-rôles)
5. [Validation et gestion d'erreurs](#validation-et-gestion-derreurs)
6. [Fonctionnalités avancées](#fonctionnalités-avancées)
7. [Guide intégration backend](#guide-intégration-backend)
8. [Déploiement et tests](#déploiement-et-tests)

---

## Vue d'ensemble

La page `RegisterPage` est la page d'inscription complète de SPOFE v2.1. Elle gère :

- ✅ Inscription multi-rôle (4 rôles distincts)
- ✅ Validation en temps réel intelligente
- ✅ Vérification d'email et username
- ✅ Force du mot de passe avec indicateurs visuels
- ✅ Support multilingue (FR)
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Intégration groupe/entreprise
- ✅ Système d'approbation personnalisé par rôle

**Localisation**: `frontend/src/pages/RegisterPage.jsx` + `RegisterPage.css`

---

## Architecture et structure

### Structure du composant

```
RegisterPage
├── État (formData, errors, validation flags)
├── Effets (chargement groupe, validation invitation)
├── Fonctions principales
│   ├── validateInvitation()
│   ├── fetchGroupeInfo()
│   ├── checkEmailAvailability()
│   ├── checkUsernameAvailability()
│   ├── handleInputChange()
│   ├── validateForm()
│   └── handleSubmit()
├── Étape 1: Informations de base (email, username, password)
└── Étape 2: Informations personnelles (rôle, profil, données consultant)
```

### Fichiers associés

| Fichier | Rôle | Taille |
|---------|------|--------|
| `RegisterPage.jsx` | Composant React principal | ~1550 lignes |
| `RegisterPage.css` | Styles du formulaire | ~1041 lignes |
| `useNotifications.jsx` | Hook notifications | ~50 lignes |

---

## Champs de formulaire

### Étape 1: Authentification

| Champ | Type | Validation | Requis | Notes |
|-------|------|-----------|--------|-------|
| Email | text | Email valide + vérification unicité | ✅ | Vérification serveur en temps réel |
| Username | text | 3-20 chars + vérification unicité | ✅ | Alphanumériques + underscore/tiret |
| Mot de passe | password | Min 8 chars, majuscule, minuscule, chiffre | ✅ | Indicateur de force visuel |
| Confirmer mot de passe | password | Doit correspondre | ✅ | Validation correspondance |

### Étape 2: Informations personnelles

#### Champs universels (tous les rôles)

| Champ | Type | Validation | Requis | Notes |
|-------|------|-----------|--------|-------|
| Profil utilisateur | select | 4 options disponibles | ✅ | Badge coloré après sélection |
| Prénom | text | 2-50 caractères | ✅ | Format: String |
| Nom | text | 2-50 caractères | ✅ | Format: String |
| Téléphone | tel | Format international | ❌ | Optionnel, format +XXX... |

#### Champs conditionnels (Consultant & Super Consultant)

| Champ | Type | Validation | Requis | Visible pour |
|-------|------|-----------|--------|--------------|
| Adresse | text | 10-200 caractères | ✅ | Consultant, Super Consultant |
| Pays | select | 195 pays du monde | ✅ | Consultant, Super Consultant |
| Type consultant | select | Catégories spécifiques | ✅ | Consultant, Super Consultant |
| Spécialités | textarea | Max 500 caractères | ✅ | Consultant, Super Consultant |
| Tarif horaire | number | Nombre positif | ✅ | Consultant, Super Consultant |
| Expérience (années) | number | 0-80 ans | ❌ | Consultant, Super Consultant |

---

## Systèmes de rôles

### 4 Rôles disponibles

#### 1️⃣ **Utilisateur** (👤 Admin compagnies)

```
Description: Gestion de votre compagnie
Accès: Création et gestion de compagnies
Champs visibles: Prénom, Nom, Téléphone uniquement
Approbation: Rapide (24-48h)
Badge couleur: Gris
```

#### 2️⃣ **Super Utilisateur** (👑 Admin groupe)

```
Description: Admin groupe - Gestion complète
Accès: Gestion de tous les utilisateurs et compagnies du groupe
Champs visibles: Prénom, Nom, Téléphone uniquement
Approbation: Vérification administrateur (48-72h)
Badge couleur: Or
```

#### 3️⃣ **Consultant** (💼 Bailleurs, Investisseurs, Associés)

```
Description: Accès en lecture aux dashboards
Accès: Visualisation des données comptables
Champs supplémentaires requis:
  - Adresse (domicile/bureau)
  - Pays (parmi 195 pays)
  - Type consultant: Bailleur, Investisseur, Associé, Actionnaire, Autre
  - Spécialités (domaines d'expertise)
  - Tarif horaire (montant neutre, sans devise)
  - Expérience (années)
Approbation: Vérification qualifications (3-5 jours)
Badge couleur: Bleu
```

#### 4️⃣ **Super Consultant** (🎓 Coachs, Mentors, Auditeurs)

```
Description: Accès complet aux infos des entreprises
Accès: Lecture/Consultation données complètes
Champs supplémentaires requis:
  - Adresse (domicile/bureau)
  - Pays (parmi 195 pays)
  - Type consultant: Coach, Mentor, Auditeur, Cabinet comptable, etc.
  - Spécialités (domaines d'expertise)
  - Tarif horaire (montant neutre, sans devise)
  - Expérience (années)
Approbation: Vérification étendue (5-7 jours)
Badge couleur: Violet
```

### Matrice de visibilité des champs

```
              | Utilisateur | Super Util. | Consultant | Super Consult.
Prénom/Nom    |      ✅     |      ✅     |     ✅     |      ✅
Téléphone     |      ✅     |      ✅     |     ✅     |      ✅
Adresse       |      ❌     |      ❌     |     ✅     |      ✅
Pays          |      ❌     |      ❌     |     ✅     |      ✅
Type Consul.  |      ❌     |      ❌     |     ✅     |      ✅
Spécialités   |      ❌     |      ❌     |     ✅     |      ✅
Tarif/h       |      ❌     |      ❌     |     ✅     |      ✅
Expérience    |      ❌     |      ❌     |     ✅     |      ✅
```

---

## Validation et gestion d'erreurs

### Validation en temps réel

Chaque champ est validé lors de la saisie via `handleInputChange()`:

```javascript
// Exemple: Validation email
case 'email':
  if (value && !isValidEmail(value)) {
    newErrors.email = 'Format email invalide';
  } else {
    delete newErrors.email;
  }
  break;
```

### Vérifications serveur

- **Email uniqueness**: Via endpoint `/api/auth/check-email/{email}`
- **Username uniqueness**: Via endpoint `/api/auth/check-username/{username}`
- **Invitation validity**: Via endpoint `/api/auth/validate-invitation`

### Messages d'erreur personnalisés

Affichés en rouge sous chaque champ problématique. Exemples:
- "Cet email est déjà utilisé"
- "Maximum 500 caractères"
- "Tarif doit être un nombre positif"
- "Type de consultant requis"

---

## Fonctionnalités avancées

### 1. Indicateur de force du mot de passe

```javascript
Logique:
- Longueur ≥ 8 caractères: +25 points
- Contient majuscules: +25 points
- Contient minuscules: +25 points
- Contient chiffres/spéciaux: +25 points

Affichage:
- 0-25%: "Faible" (rouge)
- 26-50%: "Moyen" (orange)
- 51-75%: "Bon" (jaune)
- 76-100%: "Fort" (vert)
```

### 2. Vérification d'invitation

Si invité via lien (email + token):
```
GET /api/auth/validate-invitation?token=XXX&email=user@mail.com
- Valide: Auto-remplit l'email
- Invalide: Redirection vers login
```

### 3. Intégration groupe

Si `groupeId` en paramètre URL:
```
- Récupère info groupe via GET /api/groupes/{id}
- Affiche message approbation personnalisé
- Ajoute groupeId au payload d'enregistrement
```

### 4. Validation multi-étape

**Étape 1 validation**:
- ✅ Email valide et disponible
- ✅ Username disponible
- ✅ Mot de passe fort
- ✅ Confirmation mot de passe

**Étape 2 validation**:
- ✅ Prénom/Nom requis
- ✅ Rôle sélectionné
- ✅ Si consultant: tous les champs consultant
- ✅ Si super_consultant: type_consultant requis

---

## Guide intégration backend

### Payload d'enregistrement

```javascript
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!",
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "+221 77 123 45 67",
  "role": "consultant",
  
  // Champs conditionnels (si consultant ou super_consultant)
  "adresse": "123 Rue de la Paix, Dakar",
  "pays": "SN",
  "specialites": "Comptabilité générale, audit interne, etc.",
  "tarif_horaire": 50000,
  "experience_years": 5,
  "type_consultant": "bailleur",
  
  // Champs groupe (optionnel)
  "groupeId": 1,
  "invitationToken": "abc123xyz"
}
```

### Réponses API attendues

#### Succès d'enregistrement
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "john_doe",
    "role": "consultant"
  },
  "requiresApproval": true
}
```

#### Erreur validation
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": {
    "email": "Cet email est déjà utilisé",
    "username": "Ce username est déjà pris"
  }
}
```

### Points d'intégration backend critiques

1. **POST `/api/auth/register`**
   - Valide les données
   - Crée l'utilisateur
   - Retourne confirmation

2. **GET `/api/auth/check-email/{email}`**
   - Retourne: `{ available: boolean }`

3. **GET `/api/auth/check-username/{username}`**
   - Retourne: `{ available: boolean }`

4. **GET `/api/auth/validate-invitation`**
   - Query params: `token`, `email`
   - Retourne: `{ valid: boolean }`

5. **GET `/api/groupes/{id}`**
   - Retourne infos groupe pour pré-remplissage

---

## Déploiement et tests

### Environnement local

```bash
# 1. Démarrer le serveur frontend
cd frontend
npm run dev

# 2. Accéder à la page
http://127.0.0.1:5173/register

# 3. Le backend doit être en cours d'exécution
# PORT: 3001
# Base de données: MySQL avec tables utilisateurs
```

### Checklist de test

- [ ] Formulaire affiche correctement (2 étapes)
- [ ] Étape 1: Validation email/username/password
- [ ] Étape 1: Indicateur force mot de passe
- [ ] Vérification unicité email (serveur)
- [ ] Vérification unicité username (serveur)
- [ ] Étape 2: Sélection rôle affiche badge
- [ ] Étape 2: Champs conditionnels par rôle
- [ ] Consultant: Tous les 8 champs visibles
- [ ] Super Consultant: Type consultant requis
- [ ] Utilisateur/Super Utilisateur: Pas de champs consultant
- [ ] Validation formulaire complet avant envoi
- [ ] Pays: Affiche région dynamique (Afrique, Europe, etc.)
- [ ] Type consultant: Options différentes par rôle
- [ ] Tarif horaire: Aucun symbole monétaire (XOF enlevé)
- [ ] Responsive: Desktop, Tablet (768px), Mobile (480px)

### Cas de test critiques

1. **Inscription Consultant**
   - Rôle: Consultant
   - Type: Bailleur
   - Doit avoir: Adresse, Pays, Spécialités, Tarif, Expérience

2. **Inscription Super Consultant**
   - Rôle: Super Consultant
   - Type: Coach, Mentor, Auditeur, ou Cabinet comptable
   - Doit avoir: Adresse, Pays, Spécialités, Tarif, Expérience

3. **Inscription Utilisateur**
   - Rôle: Utilisateur
   - Ne doit PAS avoir: Champs consultant
   - Seul: Prénom, Nom, Téléphone

4. **Invitation groupe**
   - URL: `/register?email=user@mail.com&token=xyz&groupeId=1`
   - Pré-remplit email
   - Affiche message approbation groupe

---

## Fichiers modifiés (v2.2)

### Additions
- ✅ Fonction `getRegionByCountry()` - Retourne région selon pays
- ✅ Constante `PAYS_LIST` - Liste complète 195 pays
- ✅ Champ `type_consultant` - Sélecteur type consultant
- ✅ Options pour Consultant: Bailleur, Investisseur, Associé, Actionnaire
- ✅ Options pour Super Consultant: Coach, Mentor, Auditeur, Cabinet, etc.
- ✅ Remplacement SIRET → Adresse + Pays

### Modifications
- ✅ Flex layout pour cartes de fonctionnalités (colonne)
- ✅ Info-section reste en ligne (3 cartes)
- ✅ Tarif horaire: Label "XOF" enlevé
- ✅ Placeholder spécialités: Ajout "etc."
- ✅ Hint pays: Dynamique selon sélection

### Suppression
- ❌ Champ SIRET (remplacé par Adresse)
- ❌ Zone "WAEMU" fixe (remplacé par région dynamique)

---

## Notes de mise à jour à la base de données

### Schéma utilisateur à mettre à jour

```sql
ALTER TABLE users ADD COLUMN adresse VARCHAR(200);
ALTER TABLE users ADD COLUMN pays VARCHAR(5);
ALTER TABLE users ADD COLUMN specialites TEXT;
ALTER TABLE users ADD COLUMN tarif_horaire DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN experience_years INT;
ALTER TABLE users ADD COLUMN type_consultant VARCHAR(50);
ALTER TABLE users DROP COLUMN siret;
```

### Migration des données existantes

```sql
-- Récupérer SIRET si existant
SELECT id, siret FROM users WHERE siret IS NOT NULL;

-- Créer enregistrement historique avant suppression
CREATE TABLE users_history AS SELECT * FROM users;
```

---

## Statut de validation

✅ **Frontend**: Complètement intégré  
✅ **Validation client**: Tests passants  
⏳ **Backend**: Prêt pour intégration  
⏳ **Base de données**: En attente de migration  
⏳ **Tests E2E**: À planifier  

---

**Prochaines étapes**:
1. Mettre à jour schéma base de données
2. Intégrer endpoints backend
3. Tests E2E complets
4. Déploiement production

