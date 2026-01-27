# 🔧 PHASE 2 - MODÈLES SEQUELIZE SPOFE v2.2

**Date**: 25 Janvier 2026  
**Durée Estimée**: 6-8 heures  
**Status**: 🟡 **PRÊT À DÉMARRER (après Phase 1)**

---

## 📋 OBJECTIF PHASE 2

Assurer que **TOUS** les modèles Sequelize:
1. ✅ Existent (14 tables = 14 modèles)
2. ✅ Configuration SPOFE v2.2 (underscored, timestamps, paranoid)
3. ✅ Hooks audit (beforeCreate, beforeUpdate, afterCreate)
4. ✅ Associations correctes (bidirectionnelles)
5. ✅ Scopes par défaut (soft delete)
6. ✅ Indices optimisés
7. ✅ Tests unitaires

---

## 📊 INVENTORY MODÈLES ACTUELS

### Modèles Existants ✅ (10 modèles)

```javascript
cascade/src/models/
├── user.model.js                  ✅ EXISTANT
├── company.model.js               ⚠️ À RENOMMER → compagnie.model.js
├── journalEntry.model.js          ✅ EXISTANT
├── chartOfAccount.model.js        ✅ EXISTANT
├── thirdParty.model.js            ✅ EXISTANT
├── role.model.js                  ✅ EXISTANT
├── journalEntryLine.model.js      ✅ EXISTANT
├── accountBalance.model.js        ✅ EXISTANT
├── appSetting.model.js            ⚠️ À RENOMMER → appSettings.model.js
└── securityEvent.model.js         ✅ EXISTANT
```

### Modèles Manquants ❌ (4 modèles CRITIQUES)

```javascript
cascade/src/models/
├── groupeEntreprise.model.js      ❌ MANQUANT (organisationnel)
├── twoFactorAuth.model.js         ❌ MANQUANT (authentification)
├── passwordResetToken.model.js    ❌ MANQUANT (authentification)
├── tokenBlacklist.model.js        ❌ MANQUANT (authentification)
├── auditTrail.model.js            ❌ MANQUANT (audit)
└── [consultant models]            ❌ À ÉVALUER
```

---

## 🛠️ CHECKLIST CONFIGURATION MODÈLE

Chaque modèle DOIT avoir cette structure:

```javascript
// cascade/src/models/{TableName}.model.js
const {TableName} = sequelize.define('{TableName}', {
  // ✅ Colonnes définies avec types corrects
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Identifiant unique'
  },
  // ... autres colonnes ...
  
  // ✅ Timestamps (Sequelize auto-crée)
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  // ✅ Soft delete si paranoid
  deleted_at: DataTypes.DATE, // si paranoid: true
}, {
  // ✅ Configuration SPOFE v2.2 OBLIGATOIRE
  tableName: '{table_name}',           // snake_case en BD
  underscored: true,                   // id → id, créé_at → created_at
  timestamps: true,                    // Auto created_at/updated_at
  paranoid: {true|false},              // Si soft delete
  createdAt: 'created_at',             // Mapping colonne
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  sequelize,                           // instance Sequelize
  
  // ✅ Scopes par défaut
  defaultScope: {
    attributes: { exclude: ['password', 'secret'] }, // Sensibles
    // Si paranoid: soft delete auto inclus
  },
  
  // ✅ Scopes additionnels
  scopes: {
    active: {
      where: { is_active: true }
    },
    includeDeleted: {
      paranoid: false // Récupère soft-deleted
    },
    summary: {
      attributes: ['id', 'name', 'created_at']
    }
  }
});

// ✅ Hooks SPOFE v2.2 (à ajouter)
{TableName}.addHook('beforeCreate', 'auditCreate', async (instance, options) => {
  // Normalisation métier
  // Validation supplémentaire
});

{TableName}.addHook('beforeUpdate', 'auditUpdate', async (instance, options) => {
  // Enregistrement audit_trails
  // Validation état ancien → nouveau
});

{TableName}.addHook('afterCreate', 'logCreation', async (instance, options) => {
  // security_events.create()
  // Notification si needed
});

// ✅ Associations (bidirectionnelles)
{TableName}.belongsTo(models.{RelatedModel}, { 
  foreignKey: '{model_id}',
  as: '{relatedModelPlural}'
});

{TableName}.hasMany(models.{OtherModel}, {
  foreignKey: '{table_name}_id',
  as: '{otherModelPlural}'
});

// ✅ Export
module.exports = {TableName};
```

---

## 📝 MODÈLES À CRÉER / CORRIGER

### 1. ❌ groupeEntreprise.model.js (NEW - CRITIQUE)

**Priorité**: 🔴 Critique  
**Effort**: 45 min  
**Dépendances**: Aucune (racine)

```javascript
// cascade/src/models/groupeEntreprise.model.js
const GroupeEntreprise = sequelize.define('GroupeEntreprise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'Code unique groupe (ex: GRP001)'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du groupe'
  },
  description: DataTypes.TEXT,
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'BJ',
    comment: 'Code pays ISO 2'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'XOF',
    comment: 'Devise de base'
  },
  fiscal_year_end: {
    type: DataTypes.INTEGER, // Jour 1-31
    defaultValue: 31,
    comment: 'Jour fin exercice (mois = 12)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Timestamps auto par Sequelize
}, {
  tableName: 'groupes_entreprises',
  underscored: true,
  timestamps: true,
  paranoid: true, // Soft delete
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Hooks
GroupeEntreprise.addHook('beforeCreate', async (groupe) => {
  // Validation: country ISO 2
  if (groupe.country && groupe.country.length !== 2) {
    throw new Error('Country must be ISO 2 code');
  }
  // Validation: currency ISO 3
  if (groupe.currency && groupe.currency.length !== 3) {
    throw new Error('Currency must be ISO 3 code');
  }
});

// Associations
GroupeEntreprise.hasMany(models.Compagnie, {
  foreignKey: 'groupe_id',
  as: 'compagnies'
});

GroupeEntreprise.hasMany(models.User, {
  foreignKey: 'groupe_id',
  as: 'users'
});

module.exports = GroupeEntreprise;
```

**Tests à ajouter**:
```javascript
// cascade/tests/models/groupeEntreprise.model.test.js
test('GroupeEntreprise CRUD + soft delete', async () => {
  const groupe = await GroupeEntreprise.create({
    code: 'GRP001',
    name: 'Test Group',
    country: 'BJ',
    currency: 'XOF'
  });
  
  expect(groupe.id).toBeDefined();
  expect(groupe.code).toBe('GRP001');
  
  // Soft delete
  await groupe.destroy();
  const found = await GroupeEntreprise.findByPk(groupe.id);
  expect(found).toBeNull(); // Soft deleted
  
  // Restore
  await groupe.restore();
  const restored = await GroupeEntreprise.findByPk(groupe.id);
  expect(restored).toBeDefined();
});
```

---

### 2. ❌ twoFactorAuth.model.js (NEW - IMPORTANT)

**Priorité**: 🟠 Important  
**Effort**: 40 min  
**Dépendances**: User

```javascript
// cascade/src/models/twoFactorAuth.model.js
const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
    comment: 'Utilisateur (unique: 1 per user)'
  },
  secret: {
    type: DataTypes.STRING(500), // Chiffré AES-256
    allowNull: false,
    comment: 'Secret TOTP chiffré'
  },
  backup_codes: {
    type: DataTypes.JSON,
    comment: 'Array de 8 codes backup [code, used]'
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag activation 2FA'
  },
  enabled_at: DataTypes.DATE,
  // Timestamps auto
}, {
  tableName: 'two_factor_auths',
  underscored: true,
  timestamps: true,
  paranoid: false, // 2FA pas soft-deletée (suppression directe)
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Hooks
TwoFactorAuth.addHook('beforeCreate', async (tfa) => {
  // Secret doit être chiffré avant stockage
  if (!tfa.secret || !tfa.secret.startsWith('enc_')) {
    const encryptedSecret = encryptSecret(tfa.secret);
    tfa.secret = encryptedSecret;
  }
  
  // Générer backup codes
  if (!tfa.backup_codes) {
    tfa.backup_codes = generateBackupCodes(8);
  }
});

// Associations
TwoFactorAuth.belongsTo(models.User, {
  foreignKey: 'user_id'
});

module.exports = TwoFactorAuth;
```

---

### 3. ❌ passwordResetToken.model.js (NEW - IMPORTANT)

**Priorité**: 🟠 Important  
**Effort**: 35 min  
**Dépendances**: User

```javascript
// cascade/src/models/passwordResetToken.model.js
const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  token: {
    type: DataTypes.STRING(500), // Hash SHA-256 du token
    allowNull: false,
    unique: true,
    comment: 'Hash du token (jamais plain text)'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Expiration 1h après création'
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Token single-use'
  },
  used_at: DataTypes.DATE,
  // Timestamps auto
}, {
  tableName: 'password_reset_tokens',
  underscored: true,
  timestamps: true,
  paranoid: false, // Pas de soft delete pour tokens
  createdAt: 'created_at'
});

// Hooks
PasswordResetToken.addHook('beforeCreate', async (token) => {
  // Expiration 1h
  token.expires_at = new Date(Date.now() + 3600000);
});

// Scopes
PasswordResetToken.addScope('active', {
  where: {
    is_used: false,
    expires_at: { [Op.gt]: new Date() }
  }
});

// Associations
PasswordResetToken.belongsTo(models.User, {
  foreignKey: 'user_id'
});

module.exports = PasswordResetToken;
```

---

### 4. ❌ tokenBlacklist.model.js (NEW - IMPORTANT)

**Priorité**: 🟠 Important  
**Effort**: 35 min  
**Dépendances**: User

```javascript
// cascade/src/models/tokenBlacklist.model.js
const TokenBlacklist = sequelize.define('TokenBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JWT payload'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Quand JWT expire naturellement'
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Quand revoqué'
  },
  reason: {
    type: DataTypes.ENUM('logout', 'password_change', 'admin_revoke'),
    defaultValue: 'logout'
  },
  // Timestamps auto
}, {
  tableName: 'token_blacklists',
  underscored: true,
  timestamps: true,
  paranoid: false,
  createdAt: 'created_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['expires_at'] }, // Pour cleanup cron
    { fields: ['token'] } // Pour lookup rapide
  ]
});

// Hooks
TokenBlacklist.addHook('afterCreate', async (blacklist) => {
  // Enregistrer security event
  await models.SecurityEvent.create({
    user_id: blacklist.user_id,
    event_type: 'jwt_revoked',
    severity: 'info',
    description: `JWT revoqué: ${blacklist.reason}`
  });
});

// Associations
TokenBlacklist.belongsTo(models.User, {
  foreignKey: 'user_id'
});

module.exports = TokenBlacklist;
```

---

### 5. ❌ auditTrail.model.js (NEW - CRITIQUE)

**Priorité**: 🔴 Critique  
**Effort**: 45 min  
**Dépendances**: User, Compagnie

```javascript
// cascade/src/models/auditTrail.model.js
const AuditTrail = sequelize.define('AuditTrail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  compagnie_id: {
    type: DataTypes.INTEGER,
    references: { model: 'compagnies', key: 'id' }
  },
  table_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Table modifiée'
  },
  record_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'PK enregistrement'
  },
  operation: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  old_values: {
    type: DataTypes.JSON,
    comment: 'État avant (UPDATE/DELETE)'
  },
  new_values: {
    type: DataTypes.JSON,
    comment: 'État après (CREATE/UPDATE)'
  },
  ip_address: DataTypes.STRING(45), // IPv6 support
  user_agent: DataTypes.STRING(500),
  // Timestamps - created_at SEULEMENT (immuable)
}, {
  tableName: 'audit_trails',
  underscored: true,
  timestamps: false, // Pas d'updated_at (immuable)
  paranoid: false, // DELETE sur audit → erreur!
  createdAt: 'created_at',
  
  // Index pour performance queries
  indexes: [
    { fields: ['user_id'] },
    { fields: ['compagnie_id'] },
    { fields: ['table_name'] },
    { fields: ['record_id'] },
    { fields: ['created_at'] },
    { fields: ['table_name', 'record_id'] } // Composite
  ]
});

// Associations
AuditTrail.belongsTo(models.User, {
  foreignKey: 'user_id'
});

AuditTrail.belongsTo(models.Compagnie, {
  foreignKey: 'compagnie_id'
});

module.exports = AuditTrail;
```

**Immuabilité Garantie**:
```javascript
// Dans controllers (après chaque modifié):
const oldValues = instance._previousDataValues || {};
await AuditTrail.create({
  user_id: req.user.id,
  compagnie_id: req.user.compagnie_id,
  table_name: instance.constructor.tableName,
  record_id: instance.id,
  operation: 'UPDATE',
  old_values: oldValues,
  new_values: instance.dataValues,
  ip_address: req.ip,
  user_agent: req.get('user-agent')
}, { paranoid: false });
```

---

## 🏗️ RENOMMAGES À FAIRE

### ⚠️ company.model.js → compagnie.model.js

```javascript
// AVANT: cascade/src/models/company.model.js
const Company = sequelize.define('Company', {
  // ...
}, {
  tableName: 'compagnies' // ✅ Correct (BD)
});

// APRÈS: cascade/src/models/compagnie.model.js  
const Compagnie = sequelize.define('Compagnie', {
  // ...
}, {
  tableName: 'compagnies'
});

// Mise à jour index.js:
// export { Compagnie }; au lieu de { Company }
```

**Checklist renommage**:
- ☐ Renommer fichier: company.model.js → compagnie.model.js
- ☐ Renommer classe: Company → Compagnie
- ☐ Vérifier imports dans cascade/src/models/index.js
- ☐ Vérifier references dans autres modèles
- ☐ Tests unitaires du modèle

### ⚠️ appSetting.model.js → appSettings.model.js

```javascript
// Même pattern: fichier + classe
// appSetting.model.js → appSettings.model.js
// AppSetting → AppSettings (pluriel)
```

---

## 🔗 ASSOCIATIONS À VÉRIFIER

### Matrix Associations Requises

| De | Vers | Type | Commentaire |
|---|---|---|---|
| User | GroupeEntreprise | BelongsTo | groupe_id FK |
| User | Role | BelongsTo | role_id FK |
| User | TwoFactorAuth | HasOne | 1:1 |
| User | AuditTrail | HasMany | audit_trails.user_id |
| User | SecurityEvent | HasMany | security_events.user_id |
| Compagnie | GroupeEntreprise | BelongsTo | groupe_id FK |
| Compagnie | ChartOfAccount | HasMany | charts_of_accounts.compagnie_id |
| Compagnie | JournalEntry | HasMany | journal_entries.compagnie_id |
| Compagnie | AccountBalance | HasMany | account_balances.compagnie_id |
| JournalEntry | JournalEntryLine | HasMany | 1:N |
| JournalEntry | User | BelongsTo | created_by_id FK |
| JournalEntryLine | ChartOfAccount | BelongsTo | account_id FK |
| ChartOfAccount | ChartOfAccount | BelongsTo | parent_account_id (self) |
| Role | User | HasMany | users.role_id |
| AuditTrail | User | BelongsTo | user_id FK |
| AuditTrail | Compagnie | BelongsTo | compagnie_id FK |

**Vérification**:
```bash
# Test associations
npm run test:associations
```

---

## 🎯 VALIDATION MODÈLES

### Checklist par Modèle

Pour CHAQUE modèle:
```javascript
✅ tableName: snake_case
✅ underscored: true
✅ timestamps: true / false (selon domaine)
✅ paranoid: true/false (selon domaine)
✅ createdAt: 'created_at' (si timestamps)
✅ updatedAt: 'updated_at' (si timestamps)
✅ deletedAt: 'deleted_at' (si paranoid)
✅ Colonnes sensibles dans defaultScope.exclude
✅ Hooks: beforeCreate, beforeUpdate, afterCreate
✅ Associations: bidirectionnelles
✅ Indices: PK, FK, performance
✅ Scopes: active, summary, etc.
✅ Tests unitaires
```

### Test Script

```bash
# cascade/tests/models/models-validation.test.js
test('Tous modèles respectent SPOFE v2.2', async () => {
  const models = Object.values(db.models);
  
  models.forEach(Model => {
    const opts = Model.options;
    
    // snake_case
    expect(opts.tableName).toMatch(/^[a-z_]+$/);
    
    // underscored
    expect(opts.underscored).toBe(true);
    
    // timestamps
    if (!['TokenBlacklist', 'PasswordResetToken'].includes(Model.name)) {
      expect(opts.timestamps).toBe(true);
      expect(opts.createdAt).toBe('created_at');
      expect(opts.updatedAt).toBe('updated_at');
    }
    
    // paranoid si business data
    const businessModels = ['User', 'Compagnie', 'JournalEntry', ...];
    if (businessModels.includes(Model.name)) {
      expect(opts.paranoid).toBe(true);
      expect(opts.deletedAt).toBe('deleted_at');
    }
  });
});
```

---

## 📅 CALENDRIER EXÉCUTION

### Jour 1 (Matin - Créations)
```
09:00-09:45 : groupeEntreprise.model.js
09:45-10:30 : twoFactorAuth.model.js
10:30-11:00 : Pause
11:00-11:35 : passwordResetToken.model.js
11:35-12:15 : tokenBlacklist.model.js
```

### Jour 1 (Après-midi - Vérifications)
```
13:15-14:00 : auditTrail.model.js
14:00-14:45 : Renommages company → compagnie, appSetting → appSettings
14:45-15:30 : Associations audit + vérifications
15:30-16:00 : Tests unitaires
16:00       : Relecture complète
```

### Jour 2 (Validation)
```
09:00-11:00 : Tests complets
11:00-12:00 : Code review
13:15-14:00 : Fixes si needed
14:00       : Signature + merge
```

**Total**: 2 jours, 10h effective = Fin Mercredi

---

## ✅ DELIVERABLES

### Fin Jour 1 (EOD)
✅ groupeEntreprise.model.js (tests passent)  
✅ twoFactorAuth.model.js (tests passent)  
✅ passwordResetToken.model.js (tests passent)  
✅ tokenBlacklist.model.js (tests passent)  
✅ auditTrail.model.js (tests passent)  
✅ compagnie.model.js (renommé + tests)  
✅ appSettings.model.js (renommé + tests)  
✅ Associations vérifiées  

### Fin Jour 2 (EOD)
✅ Tests globaux: 100% passage  
✅ Coverage modèles: 95%+ CRUD  
✅ Coverage associations: 100%  
✅ Code review: approved  
✅ Merge en develop branch  

---

## 🚀 PROCHAINES PHASES

Après Phase 2 ✅:

### Phase 3: Hooks Sequelize (4-6h)
- Audit trail automatique
- Security events
- Data validation

### Phase 4: Frontend Integration (4-6h)
- DTOs alignment
- API validation

---

**Status**: 🟡 **PRÊT (après Phase 1)**  
**Dépend de**: Phase 1 Documentation complétée
