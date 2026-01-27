# Exemple d'Utilisation - RegisterPage Modifiée

**Scénario de Test:** Enregistrement d'un Consultant  
**Date:** 24 Janvier 2026  

---

## 🎯 Scénario Complet d'Utilisation

### Étape 1: L'Utilisateur Accède au Formulaire

**URL:** `http://localhost:5173/register`

**Interface Affichée:**
```
┌──────────────────────────────────────────────────────────┐
│                      SPOFE v2.1                          │
│                  Créer votre compte                      │
│                                                          │
│  Rejoignez SPOFE et gérez votre comptabilité            │
│                                                          │
│  Étape 1/2: Informations de connexion                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📧 Adresse email *                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ consultant@example.com            ✓ (vérifié)  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  👤 Nom d'utilisateur *                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ consultant_expert                 ✓ (disponible)   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  🔒 Mot de passe *                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ••••••••••••••  👁️                              │   │
│  └─────────────────────────────────────────────────┘   │
│  Force: ████████░░ Bon (75%)                           │
│                                                          │
│  🔒 Confirmer le mot de passe *                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ••••••••••••••  👁️                              │   │
│  └─────────────────────────────────────────────────┘   │
│  ✓ Les mots de passe correspondent                     │
│                                                          │
│                                  [Suivant →]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### Étape 2: Remplir les Informations Personnelles

**Après clic "Suivant":**

```
┌──────────────────────────────────────────────────────────┐
│                      SPOFE v2.1                          │
│                  Créer votre compte                      │
│                                                          │
│  Étape 2/2: Informations personnelles                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👤 Profil utilisateur *                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Consultant                                    ▼] │   │
│  │ • Utilisateur Standard                          │   │
│  │ • Super Utilisateur                             │   │
│  │ • Consultant        ← SÉLECTIONNÉ               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────┐                            │
│  │ 👔 Consultant          │                            │
│  └─────────────────────────┘                            │
│  💡 Vous accédez aux outils de gestion de projets       │
│     et de facturation                                   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Prénom *        │ Nom *                         │   │
│  │ ┌──────────┐    │ ┌─────────────────┐           │   │
│  │ │ Marie    │    │ │ Martin          │           │   │
│  │ └──────────┘    │ └─────────────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📞 Téléphone                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ +221 77 123 45 67                               │   │
│  └─────────────────────────────────────────────────┘   │
│  💡 Optionnel - Format international recommandé         │
│                                                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📋 Informations Consultant                      │  │
│  │ Complétez votre profil professionnel            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │ Identification SIRET *                          │  │
│  │ ┌────────────────────────────────────────────┐ │  │
│  │ │ 12345678901234                             │ │  │
│  │ └────────────────────────────────────────────┘ │  │
│  │ 💡 14 chiffres du numéro SIRET                 │  │
│  │                                                  │  │
│  │ Spécialités *                                   │  │
│  │ ┌────────────────────────────────────────────┐ │  │
│  │ │ Comptabilité générale, audit fiscal,      │ │  │
│  │ │ conseils en fiscalité, gestion de budget   │ │  │
│  │ └────────────────────────────────────────────┘ │  │
│  │ 123/500 caractères                              │  │
│  │                                                  │  │
│  │ Tarif horaire (XOF) *  │ Expérience (années)   │  │
│  │ ┌──────────────────┐   │ ┌──────────────────┐ │  │
│  │ │ 75000            │   │ │ 12               │ │  │
│  │ └──────────────────┘   │ └──────────────────┘ │  │
│  │ 💡 Montant en XOF      │ 💡 Années d'expérience │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ℹ️ À savoir: En tant que consultant, votre demande    │
│     sera examinée par les administrateurs qui          │
│     vérifieront vos qualifications et votre            │
│     expérience.                                        │
│                                                          │
│  [← Retour]              [Créer mon compte 🚀]         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 💾 Données Soumises au Backend

**Payload JSON envoyé à `/api/auth/register`:**

```json
{
  "email": "consultant@example.com",
  "username": "consultant_expert",
  "password": "SecurePass123!",
  "prenom": "Marie",
  "nom": "Martin",
  "telephone": "+221 77 123 45 67",
  "role": "consultant",
  "siret": "12345678901234",
  "specialites": "Comptabilité générale, audit fiscal, conseils en fiscalité, gestion de budget",
  "tarif_horaire": 75000,
  "experience_years": 12,
  "groupeId": null,
  "invitationToken": null
}
```

---

## ✅ Validation Frontend (Avant Submit)

**État du formulaire validé:**

```javascript
// formData
{
  email: "consultant@example.com",           ✓ Valid email format
  username: "consultant_expert",             ✓ 3-30 chars, alphanumeric
  password: "SecurePass123!",                ✓ >= 8 chars, mixed case
  confirmPassword: "SecurePass123!",         ✓ Matches password
  prenom: "Marie",                           ✓ Non-empty
  nom: "Martin",                             ✓ Non-empty
  telephone: "+221 77 123 45 67",           ✓ Valid phone format (optional)
  role: "consultant",                        ✓ Valid role
  siret: "12345678901234",                   ✓ 14 digits (consultant required)
  specialites: "Comptabilité...",            ✓ <= 500 chars (consultant required)
  tarif_horaire: "75000",                    ✓ Positive number (consultant required)
  experience_years: "12",                    ✓ 0-80 (consultant optional)
}

// errors
{}  // Pas d'erreurs

// État des vérifications
emailAvailable: true           // ✓ Email non utilisé
usernameAvailable: true        // ✓ Username disponible
passwordStrength: 85           // ✓ Bon (> 75)
```

---

## 📡 Réponse Backend

**Si enregistrement immédiat (sans groupe):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 42,
      "email": "consultant@example.com",
      "username": "consultant_expert",
      "prenom": "Marie",
      "nom": "Martin",
      "telephone": "+221 77 123 45 67",
      "role": "consultant",
      "siret": "12345678901234",
      "specialites": "Comptabilité générale, audit fiscal...",
      "tarif_horaire": 75000,
      "experience_years": 12,
      "hierarchy_level": 4,
      "can_grant_permissions": false,
      "isActive": true,
      "createdAt": "2026-01-24T15:50:00Z"
    },
    "requiresApproval": false,
    "message": "Consultant account created successfully"
  },
  "statusCode": 201
}
```

**Si enregistrement avec groupe (requiresApproval = true):**

```json
{
  "success": true,
  "data": {
    "user": null,
    "requiresApproval": true,
    "message": "Your consultant registration request has been submitted for approval"
  },
  "statusCode": 202
}
```

---

## 🎉 Feedback Utilisateur

### Cas 1: Enregistrement Immédiat Réussi

**Notification affichée:**

```
┌─────────────────────────────────────────┐
│ ✓ Inscription réussie !                 │
├─────────────────────────────────────────┤
│ Bienvenue ! Votre profil consultant     │
│ a été créé avec succès.                 │
│                                         │
│ Vous serez redirigé vers la connexion.  │
│                             [OK]        │
└─────────────────────────────────────────┘
```

**Redirection:** `http://localhost:5173/login`

---

### Cas 2: Enregistrement Avec Approbation

**Notification affichée:**

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Inscription soumise !                                 │
├─────────────────────────────────────────────────────────┤
│ Votre demande d'adhésion en tant que consultant a       │
│ été soumise pour approbation. Un administrateur         │
│ examinera votre profil et vos qualifications.           │
│                                                         │
│ Vous recevrez un email lorsque votre compte sera        │
│ activé.                                                 │
│                                             [OK]        │
└─────────────────────────────────────────────────────────┘
```

**Login Page avec Contexte:**

```
┌────────────────────────────────────┐
│    Connexion à SPOFE v2.1          │
├────────────────────────────────────┤
│                                    │
│ 💬 Votre compte est en attente     │
│    d'approbation. Vous recevrez    │
│    un email lorsque votre compte   │
│    sera activé.                    │
│                                    │
│ Email déjà rempli:                 │
│ consultant@example.com             │
│                                    │
│ [Retour à l'accueil]               │
└────────────────────────────────────┘
```

---

## 🔍 État Base de Données Après Enregistrement

### Table `users`

```sql
SELECT * FROM users WHERE email='consultant@example.com';
```

**Résultat:**

| id | email | username | prenom | nom | telephone | role | siret | specialites | tarif_horaire | experience_years | hierarchy_level | can_grant_permissions | isActive |
|----|-------|----------|--------|-----|-----------|------|-------|-------------|---------------|-----------------|---|---|---|
| 42 | consultant@example.com | consultant_expert | Marie | Martin | +221 77 123 45 67 | consultant | 12345678901234 | Comptabilité générale, audit... | 75000 | 12 | 4 | 0 | 1 |

---

### Table `pending_role_approvals` (Si approbation requise)

```sql
SELECT * FROM pending_role_approvals 
WHERE email='consultant@example.com';
```

**Résultat:**

| id | email | requested_role | consultant_info | status | created_at | reviewed_by | reviewed_at | notes |
|----|-------|---|---|---|---|---|---|---|
| 15 | consultant@example.com | consultant | `{"siret":"12345678901234","specialites":"...","tarif_horaire":75000}` | pending | 2026-01-24 15:50:00 | NULL | NULL | NULL |

---

## 🧪 Scénarios de Test Additionnels

### Test 1: Validation Email Vide (Rôle Consultant)

**Actions:**
1. Sélectionner "Consultant"
2. Laisser email vide
3. Cliquer "Créer mon compte"

**Résultat Attendu:**
```
Erreur Email: "Email requis"
Bouton soumission désactivé
Notification: "Formulaire invalide - Veuillez corriger les erreurs"
```

---

### Test 2: SIRET Invalide (Rôle Consultant)

**Actions:**
1. Sélectionner "Consultant"
2. Remplir SIRET: "ABC123456789" (13 chars + lettres)
3. Blur du champ

**Résultat Attendu:**
```
Erreur SIRET: "SIRET doit contenir 14 chiffres"
Champ background rouge
Bouton soumission désactivé
```

---

### Test 3: Changement de Rôle Avec Données

**Actions:**
1. Sélectionner "Consultant" et remplir tous les champs
2. Sélectionner "Utilisateur Standard"
3. La section consultant disparaît
4. Sélectionner à nouveau "Consultant"

**Résultat Attendu:**
```
✓ Données conservées en state
✓ Section réapparaît avec données précédentes
✓ Validation refonctionne correctement
```

---

### Test 4: Validation Spécialités > 500 Chars

**Actions:**
1. Sélectionner "Consultant"
2. Entrer 501 caractères dans Spécialités
3. Observer le compteur

**Résultat Attendu:**
```
Compteur: "501/500" (rouge)
Erreur: "Maximum 500 caractères"
Bouton soumission désactivé
```

---

## 📊 Comparaison Avant/Après

### Avant Implémentation

**Interface:**
- 2 étapes, 8 champs
- Pas de sélecteur rôle
- Messages génériques
- Pas de validation consultant

**UX:**
```
RegisterPage
├─ Étape 1: Email, username, password (4 inputs)
├─ Étape 2: Prenom, nom, telephone (3 inputs)
└─ Message générique: "Inscription réussie"
```

---

### Après Implémentation

**Interface:**
- 2 étapes, 13 champs (9 base + 5 consultant)
- Sélecteur rôle avec badge
- Messages contextualisés
- Validation conditionnelle

**UX:**
```
RegisterPage
├─ Étape 1: Email, username, password (4 inputs)
├─ Étape 2: 
│  ├─ Rôle (select)
│  ├─ Prénom, nom, téléphone (3 inputs)
│  └─ IF rôle === 'consultant':
│     ├─ Informations Consultant (section)
│     ├─ SIRET (input)
│     ├─ Spécialités (textarea)
│     ├─ Tarif horaire (input)
│     └─ Expérience (input)
└─ Messages personnalisés par rôle
```

---

## 🎯 Points d'Intérêt

### Affichage Intelligent

```jsx
// Les champs consultant ne s'affichent QUE si:
{formData.role === 'consultant' && (
  <div className="consultant-fields-section">
    {/* Affiche les 4 champs */}
  </div>
)}
```

**Avantages:**
- Interface propre (pas de clutter)
- Pas de champs inutiles pour autres rôles
- UX fluide et intuitive

---

### Validation Conditionnelle

```javascript
// Validation stricte SEULEMENT pour consultants
if (formData.role === 'consultant') {
  // SIRET: obligatoire + format
  // Spécialités: obligatoires + max 500
  // Tarif: obligatoire + positif
  // Expérience: optionnel + 0-80
}
```

**Avantages:**
- Utilisateurs standard ne voient pas d'erreurs consultant
- Consultants voyent validation appropriée
- Flexibilité du système

---

### Personnalisation des Messages

```javascript
const roleMessages = {
  consultant: 'Votre demande d\'adhésion...',
  super_utilisateur: 'Votre demande d\'accès...',
  utilisateur: 'Votre inscription...'
};
```

**Avantages:**
- Clarté du processus d'approbation
- Expectations correctes par rôle
- Meilleure satisfaction utilisateur

---

## 🔐 Sécurité

### Validations Appliquées

| Champ | Frontend | Backend | Notes |
|-------|----------|---------|-------|
| Email | Regex + API check | Exists check | Double validation |
| Username | Regex + API check | Unique constraint | Double validation |
| Password | Length + strength | Bcrypt hash | Sécurisé |
| SIRET | Regex 14 digits | Exists check | Format + value |
| Tarif | Positive number | Type validation | Math safe |

---

## 📚 Documentation Associée

- 📄 [REGISTERPAGE_IMPLEMENTATION_COMPLETE.md](REGISTERPAGE_IMPLEMENTATION_COMPLETE.md) - Détails techniques
- 📋 [REGISTERPAGE_TEST_GUIDE.md](REGISTERPAGE_TEST_GUIDE.md) - Procédures de test
- 📊 [PROJECT_STATUS_COMPLETE.md](PROJECT_STATUS_COMPLETE.md) - Statut global

---

**Exemple Créé:** 24 Janvier 2026  
**Validité:** Pour version RegisterPage.jsx modifiée  
**Environnement:** Local (localhost:5173)

