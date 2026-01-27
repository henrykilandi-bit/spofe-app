# 🔧 Backend Integration Guide - RegisterPage v2.2

**Pour l'équipe backend**  
**Date**: 24 janvier 2026  
**Version**: 2.2

---

## 📋 Tâches prioritaires

### 1️⃣ URGENT: Mise à jour base de données

**Exécuter ces migrations SQL:**

```sql
-- Ajouter nouvelles colonnes pour Consultant/Super Consultant
ALTER TABLE users ADD COLUMN IF NOT EXISTS adresse VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pays VARCHAR(5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialites LONGTEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tarif_horaire DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS type_consultant VARCHAR(50);

-- Supprimer l'ancienne colonne SIRET
ALTER TABLE users DROP COLUMN IF EXISTS siret;

-- Ajouter index pour recherche rapide
ALTER TABLE users ADD INDEX idx_pays (pays);
ALTER TABLE users ADD INDEX idx_role (role);
ALTER TABLE users ADD INDEX idx_type_consultant (type_consultant);
```

**Vérification:**
```sql
DESCRIBE users;
-- Doit montrer: adresse, pays, specialites, tarif_horaire, experience_years, type_consultant
-- Doit PAS montrer: siret
```

---

### 2️⃣ URGENT: Mise à jour User Model

**Fichier**: `cascade/src/models/user.model.js`

**Ajouter propriétés:**

```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM(
      'utilisateur',
      'super_utilisateur',
      'consultant',
      'super_consultant'
    ),
    allowNull: false,
    defaultValue: 'utilisateur'
  },

  // ✅ NEW: Consultant fields
  adresse: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: {
        args: [10, 200],
        msg: 'Adresse: 10-200 caractères'
      }
    }
  },
  pays: {
    type: DataTypes.STRING(5),
    allowNull: true,
    validate: {
      len: {
        args: [2, 5],
        msg: 'Code pays invalide'
      }
    }
  },
  specialites: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Maximum 500 caractères'
      }
    }
  },
  tarif_horaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
      msg: 'Tarif doit être positif'
    }
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 80,
      msg: 'Expérience: 0-80 ans'
    }
  },
  type_consultant: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isValidType(value) {
        const validTypes = {
          consultant: ['bailleur', 'investisseur', 'associe', 'actionnaire', 'autre'],
          super_consultant: ['coach', 'mentor', 'auditeur', 'cabinet_comptable', 'conseil_fiscal', 'expert_comptable', 'autre']
        };
        // Validation appliquée en controller
      }
    }
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

module.exports = User;
```

---

### 3️⃣ URGENT: Validation Controller

**Fichier**: `cascade/src/controllers/auth.controller.js`

**Ajouter cette validation dans `register()`:**

```javascript
exports.register = async (req, res, next) => {
  try {
    const { 
      email, username, password, prenom, nom, telephone, role,
      // NEW: Consultant fields
      adresse, pays, specialites, tarif_horaire, experience_years, type_consultant
    } = req.body;

    // ✅ Validation basique
    if (!email || !username || !password || !prenom || !nom || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Champs requis manquants' 
      });
    }

    // ✅ Validation rôle
    const validRoles = ['utilisateur', 'super_utilisateur', 'consultant', 'super_consultant'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rôle invalide' 
      });
    }

    // ✅ Validation consultant/super_consultant
    if ((role === 'consultant' || role === 'super_consultant') && !type_consultant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type de consultant requis',
        errors: { type_consultant: 'Type de consultant manquant' }
      });
    }

    // ✅ Valider type_consultant selon le rôle
    const consultantTypes = {
      consultant: ['bailleur', 'investisseur', 'associe', 'actionnaire', 'autre'],
      super_consultant: ['coach', 'mentor', 'auditeur', 'cabinet_comptable', 'conseil_fiscal', 'expert_comptable', 'autre']
    };

    if ((role === 'consultant' || role === 'super_consultant')) {
      const validTypes = consultantTypes[role];
      if (!validTypes.includes(type_consultant)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Type de consultant invalide pour ce rôle',
          errors: { type_consultant: `Valeurs acceptées: ${validTypes.join(', ')}` }
        });
      }
    }

    // ✅ Validation pays (code ISO)
    if ((role === 'consultant' || role === 'super_consultant') && !pays) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pays requis',
        errors: { pays: 'Pays manquant' }
      });
    }

    // ✅ Validation tarif horaire (doit être positif, pas de devise)
    if ((role === 'consultant' || role === 'super_consultant')) {
      if (!tarif_horaire || parseFloat(tarif_horaire) < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tarif horaire invalide',
          errors: { tarif_horaire: 'Tarif doit être positif' }
        });
      }
    }

    // ✅ Créer l'utilisateur avec tous les champs
    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      prenom,
      nom,
      telephone: telephone || null,
      role,
      // NEW: Consultant fields
      adresse: (role === 'consultant' || role === 'super_consultant') ? adresse : null,
      pays: (role === 'consultant' || role === 'super_consultant') ? pays : null,
      specialites: (role === 'consultant' || role === 'super_consultant') ? specialites : null,
      tarif_horaire: (role === 'consultant' || role === 'super_consultant') ? tarif_horaire : null,
      experience_years: (role === 'consultant' || role === 'super_consultant') ? experience_years : null,
      type_consultant: (role === 'consultant' || role === 'super_consultant') ? type_consultant : null,
      isActive: false
    });

    // ✅ Retourner succès
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        ...(user.role === 'consultant' || user.role === 'super_consultant') && {
          type_consultant: user.type_consultant,
          pays: user.pays
        }
      },
      requiresApproval: true
    });

  } catch (error) {
    next(error);
  }
};
```

---

### 4️⃣ Validation Joi Schemas

**Fichier**: `cascade/src/validators/auth.validator.js`

**Ajouter/mettre à jour:**

```javascript
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Caractères alphanumériques seulement',
      'string.min': 'Minimum 3 caractères',
      'any.required': 'Username requis'
    }),
  
  password: Joi.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .required()
    .messages({
      'string.min': 'Minimum 8 caractères',
      'string.pattern.base': 'Doit contenir majuscule, minuscule et chiffre'
    }),
  
  prenom: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  nom: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  telephone: Joi.string()
    .optional()
    .allow(null, ''),
  
  role: Joi.string()
    .valid('utilisateur', 'super_utilisateur', 'consultant', 'super_consultant')
    .required(),
  
  // ✅ NEW: Consultant/Super Consultant fields
  adresse: Joi.when('role', {
    is: Joi.string().valid('consultant', 'super_consultant'),
    then: Joi.string().min(10).max(200).required(),
    otherwise: Joi.string().optional().allow(null, '')
  }),
  
  pays: Joi.when('role', {
    is: Joi.string().valid('consultant', 'super_consultant'),
    then: Joi.string().length(2).required(),
    otherwise: Joi.string().optional().allow(null, '')
  }),
  
  specialites: Joi.when('role', {
    is: Joi.string().valid('consultant', 'super_consultant'),
    then: Joi.string().max(500).required(),
    otherwise: Joi.string().optional().allow(null, '')
  }),
  
  tarif_horaire: Joi.when('role', {
    is: Joi.string().valid('consultant', 'super_consultant'),
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().optional().allow(null)
  }),
  
  experience_years: Joi.number()
    .min(0)
    .max(80)
    .optional()
    .allow(null),
  
  type_consultant: Joi.when('role', {
    is: Joi.string().valid('consultant', 'super_consultant'),
    then: Joi.string()
      .valid('bailleur', 'investisseur', 'associe', 'actionnaire', // consultant
              'coach', 'mentor', 'auditeur', 'cabinet_comptable',   // super_consultant
              'conseil_fiscal', 'expert_comptable', 'autre')
      .required(),
    otherwise: Joi.string().optional().allow(null, '')
  })
});

module.exports = { registerSchema };
```

---

## 📡 Endpoints à mettre à jour/créer

### POST `/api/auth/register`

**Payload reçu:**

```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!",
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "+221 77 123 45 67",
  "role": "consultant",
  
  "adresse": "123 Rue de la Paix, Dakar",
  "pays": "SN",
  "specialites": "Comptabilité générale, audit interne, etc.",
  "tarif_horaire": 50000,
  "experience_years": 5,
  "type_consultant": "bailleur"
}
```

**Réponse succès (201):**

```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "john_doe",
    "role": "consultant",
    "type_consultant": "bailleur",
    "pays": "SN"
  },
  "requiresApproval": true
}
```

**Réponse erreur (400):**

```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": {
    "type_consultant": "Type de consultant invalide",
    "tarif_horaire": "Tarif doit être positif"
  }
}
```

---

## ✅ Testing Checklist

### Test endpoint `/api/auth/register`

```bash
# Test 1: Consultant valide
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consultant@test.com",
    "username": "consultant_test",
    "password": "TestPass123",
    "prenom": "Jean",
    "nom": "Dupont",
    "role": "consultant",
    "adresse": "123 Rue de la Paix, Dakar",
    "pays": "SN",
    "specialites": "Comptabilité générale",
    "tarif_horaire": 50000,
    "experience_years": 5,
    "type_consultant": "bailleur"
  }'

# Test 2: Super Consultant valide
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super_consul@test.com",
    "username": "super_consul_test",
    "password": "TestPass123",
    "prenom": "Marie",
    "nom": "Martin",
    "role": "super_consultant",
    "adresse": "456 Avenue des Champs, Paris",
    "pays": "FR",
    "specialites": "Audit, Conseil",
    "tarif_horaire": 100000,
    "experience_years": 10,
    "type_consultant": "auditeur"
  }'

# Test 3: Utilisateur simple (pas de champs consultant)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "user_test",
    "password": "TestPass123",
    "prenom": "Paul",
    "nom": "Durand",
    "role": "utilisateur"
  }'

# Test 4: Erreur - type_consultant manquant pour consultant
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bad@test.com",
    "username": "bad_test",
    "password": "TestPass123",
    "prenom": "Test",
    "nom": "Test",
    "role": "consultant",
    "adresse": "123 rue",
    "pays": "SN",
    "specialites": "Test",
    "tarif_horaire": 50000
    // type_consultant MANQUANT
  }'
```

### Tests base de données

```sql
-- Vérifier structure
DESCRIBE users;

-- Vérifier utilisateurs créés
SELECT id, email, role, type_consultant, pays FROM users WHERE role IN ('consultant', 'super_consultant');

-- Vérifier index
SHOW INDEX FROM users;
```

---

## 📊 Résumé des changements

| Élément | Avant | Après |
|---------|--------|--------|
| Colonnes | 11 | 16 (+5) |
| Colonne SIRET | ✅ Présente | ❌ Supprimée |
| Type consultant | ❌ Non | ✅ Oui |
| Pays | ❌ Non | ✅ Oui |
| Adresse | ❌ Non | ✅ Oui |
| Spécialités | ❌ Non | ✅ Oui |
| Tarif horaire | ❌ Non | ✅ Oui (sans devise) |
| Expérience | ❌ Non | ✅ Oui |

---

## 🎯 Ordre d'implémentation recommandé

1. **Jour 1**: Migrer base de données + mettre à jour User model
2. **Jour 2**: Mettre à jour auth.controller.js
3. **Jour 3**: Ajouter validation Joi
4. **Jour 4**: Tests complets + déploiement

**Durée estimée**: 1-2 jours (développeur expérimenté)

---

## 🆘 Questions fréquentes

**Q: Pourquoi tarif_horaire sans devise?**  
R: Les consultants peuvent venir de n'importe quel pays (RDC, France, Côte d'Ivoire, etc.). Laisser l'interface accepter un nombre permet au frontend de convertir selon la devise locale.

**Q: Quid des anciens utilisateurs avec SIRET?**  
R: Créer migration pour backuper SIRET avant suppression, puis DROP la colonne.

**Q: Type consultant toujours requis?**  
R: OUI pour les deux rôles (consultant + super_consultant). Optionnel pour les autres rôles.

---

**Prochaines étapes:**
1. ✅ Lire ce guide
2. ✅ Exécuter migrations SQL
3. ✅ Mettre à jour User model
4. ✅ Mettre à jour auth.controller.js
5. ✅ Ajouter validations Joi
6. ✅ Tester avec tous les rôles
7. ✅ Déployer

**Questions?** Consulter [`REGISTERPAGE_DOCUMENTATION_v2.2.md`](REGISTERPAGE_DOCUMENTATION_v2.2.md)

