# Table: `users`

## 🎯 Rôle Métier

Référentiel centralisé d'authentification et d'identité pour tous les utilisateurs du système SPOFE. Gère l'accès multi-locataire (groupes d'entreprises), les rôles et permissions, ainsi que l'audit de sécurité.

**Domaine**: 🇬🇧 Identité & Sécurité (English naming convention per SPOFE v2.2)

## 🔴 Criticité

**CRITIQUE** - Table fondatrice du système
- Sans cette table: aucun utilisateur ne peut se connecter
- Impact d'erreur: Perte d'accès complète à l'application
- Dépendances sortantes: 15+ tables (journal_entries, audit_trails, etc.)
- Récupérabilité: HAUTE (soft delete activé)

## 📋 Structure

### Colonnes

```sql
CREATE TABLE users (
  id                      INT PRIMARY KEY AUTO_INCREMENT,
  groupe_entreprise_id    INT NOT NULL,                -- FK vers groupes_entreprises
  email                   VARCHAR(255) UNIQUE NOT NULL, -- Email unique (login principal)
  username                VARCHAR(100) UNIQUE NOT NULL, -- Identifiant unique
  password                VARCHAR(255) NOT NULL,       -- BCrypt hash (10 rounds min)
  first_name              VARCHAR(100),                -- Prénom
  last_name               VARCHAR(100),                -- Nom
  role_id                 INT NOT NULL,                -- FK vers roles (ADMIN, USER, VIEWER)
  is_active               BOOLEAN DEFAULT TRUE,        -- Activation/Désactivation
  is_verified             BOOLEAN DEFAULT FALSE,       -- Email verification status
  last_login_at           TIMESTAMP,                   -- Dernier login
  password_changed_at     TIMESTAMP,                   -- Dernier changement password
  two_factor_enabled      BOOLEAN DEFAULT FALSE,       -- TOTP 2FA activated
  preferences             JSON,                        -- User preferences (langue, thème)
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at              TIMESTAMP NULL,              -- Soft delete (paranoid mode)
  
  -- Constraints
  CONSTRAINT fk_users_groupe_entreprise 
    FOREIGN KEY (groupe_entreprise_id) REFERENCES groupes_entreprises(id) ON DELETE RESTRICT,
  CONSTRAINT fk_users_role 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_groupe_entreprise_id (groupe_entreprise_id),
  INDEX idx_users_role_id (role_id),
  INDEX idx_users_is_active (is_active),
  
  UNIQUE INDEX uq_users_email_groupe (email, groupe_entreprise_id, deleted_at)
);

-- Collation obligatoire
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Schéma ORM (Sequelize)

```javascript
// cascade/src/models/user.model.js
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  groupeEntrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'groupe_entreprise_id' },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  firstName: { type: DataTypes.STRING(100), field: 'first_name' },
  lastName: { type: DataTypes.STRING(100), field: 'last_name' },
  roleId: { type: DataTypes.INTEGER, allowNull: false, field: 'role_id' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_verified' },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
  passwordChangedAt: { type: DataTypes.DATE, field: 'password_changed_at' },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'two_factor_enabled' },
  preferences: { type: DataTypes.JSON, defaultValue: {} }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});
```

## 🔗 Dépendances

### Foreign Keys Sortantes (Refs OUT)
```
→ groupes_entreprises(id)  [FK] groupe_entreprise_id (REQUIRED, RESTRICT on DELETE)
→ roles(id)                [FK] role_id (REQUIRED, RESTRICT on DELETE)
```

### Foreign Keys Entrantes (Refs IN)
```
← journal_entries(created_by_id)      [FK] Créateur d'écritures
← journal_entries(updated_by_id)      [FK] Modifié par
← audit_trails(user_id)               [FK] Traçabilité audit
← security_events(user_id)            [FK] Événements sécurité
← password_reset_tokens(user_id)      [FK] Réinitialisation password
← two_factor_auths(user_id)           [FK] TOTP 2FA
← token_blacklists(user_id)           [FK] Logout/revocation
← approval_workflows(approved_by_id)  [FK] Approbations
```

### Associations Bidirectionnelles
```javascript
// User.js
User.belongsTo(GroupeEntreprise, { foreignKey: 'groupeEntrepriseId' });
User.belongsTo(Role, { foreignKey: 'roleId' });
User.hasMany(JournalEntry, { foreignKey: 'createdById', as: 'createdEntries' });
User.hasMany(AuditTrail, { foreignKey: 'userId' });
User.hasMany(SecurityEvent, { foreignKey: 'userId' });
User.hasMany(PasswordResetToken, { foreignKey: 'userId' });
User.hasMany(TwoFactorAuth, { foreignKey: 'userId' });
User.hasMany(TokenBlacklist, { foreignKey: 'userId' });

// GroupeEntreprise.js
GroupeEntreprise.hasMany(User, { foreignKey: 'groupeEntrepriseId' });

// Role.js
Role.hasMany(User, { foreignKey: 'roleId' });
```

## 📏 Règles Métier

### Domaine Applicatif
- ✅ Multi-locataire: User affilié à 1 groupe d'entreprises OBLIGATOIRE
- ✅ Unicité email: Globale sur toute instance (2 groupes ≠ peuvent avoir même email)
- ✅ Unicité username: Globale sur toute instance
- ✅ Rôle requis: User doit avoir 1 rôle valide (FK RESTRICT)
- ✅ Activation: Users peuvent être désactivés (is_active=false) sans suppression

### Validation Données
```javascript
// Email validation (RFC 5322 simplified)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Username: 3-50 chars, alphanumeric + underscore
const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;

// Password requirements (dans validation.middleware.js):
//   - Minimum 8 caractères
//   - 1 majuscule + 1 minuscule + 1 chiffre + 1 caractère spécial
//   - Vérifier non-réutilisation (derniers 5 passwords)
```

### Transitions d'État
```
Cycle de vie User:
  CREATED (is_verified=false, is_active=true)
    ↓ [Email verification]
  VERIFIED (is_verified=true)
    ↓ [Admin action]
  ACTIVE (is_active=true, prêt à login)
    ↓ [Admin désactivation OU pas de login pendant 180 jours]
  INACTIVE (is_active=false, cannot login)
    ↓ [Admin réactivation]
  ACTIVE (back to login)
    ↓ [Soft delete]
  DELETED (deleted_at IS NOT NULL, invisible sauf audit)
```

### Règles de Suppression
- ❌ Hard delete JAMAIS autorisé
- ✅ Soft delete: `UPDATE users SET deleted_at=NOW() WHERE id=?`
- ✅ Avant suppression: Vérifier pas d'écritures comptables liées en cours
- ✅ Suppression soft: Conserver audit trail complet pour traçabilité

## 🔐 Sécurité

### Authentification & Autorisation
```javascript
// Login: Email + Password (NEVER username + password)
app.post('/api/auth/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email, is_active: true } });
  if (!user) return unauthorized(res, 'Invalid credentials');
  
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return unauthorized(res, 'Invalid credentials');
  
  // Update last_login_at
  user.lastLoginAt = new Date();
  await user.save();
  
  // Generate JWT (8h expiry)
  const token = jwt.sign(
    { userId: user.id, groupeId: user.groupeEntrepriseId, roleId: user.roleId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  return success(res, { token, user: { id: user.id, email: user.email } });
});
```

### Hachage Password
- ✅ TOUJOURS utiliser BCrypt (min 10 rounds)
- ✅ JAMAIS stocker password en clair
- ✅ JAMAIS utiliser MD5, SHA1, SHA256 simple
- ❌ Ne JAMAIS retourner password_hash au frontend

### Rate Limiting (Auth)
```javascript
// cascade/src/middleware/rateLimit.middleware.js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 tentatives max
  message: 'Trop de tentatives de login, réessayez plus tard',
  skip: (req) => req.user    // Skip si déjà auth
});

app.post('/api/auth/login', loginLimiter, ...);
```

### 2FA (Two-Factor Authentication)
- ✅ TOTP (Time-based OTP) via Authenticator apps
- ✅ Optionnel lors de création account
- ✅ Obligatoire pour admins
- ✅ Backup codes générés (8 codes, single-use)

### Audit & Logs
- ✅ Login/logout: Enregistré dans `security_events`
- ✅ Failed auth: Enregistré pour alertes sécurité
- ✅ Password change: Enregistré avec `password_changed_at`
- ✅ Tous les changes: Enregistrés dans `audit_trails`

## 📊 Audit & Traçabilité

### Hooks (Sequelize)

```javascript
// cascade/src/models/user.model.js

User.beforeCreate(async (user) => {
  // Password hashing
  user.password = await bcrypt.hash(user.password, 10);
  
  // Normalisation
  user.email = user.email.toLowerCase().trim();
  user.username = user.username.trim();
  
  logInfo(`User.beforeCreate: ${user.email} (groupe_id: ${user.groupeEntrepriseId})`);
});

User.beforeUpdate(async (user) => {
  // Password change detection
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
    user.passwordChangedAt = new Date();
  }
  
  logInfo(`User.beforeUpdate: ${user.email}`);
});

User.afterCreate(async (user, options) => {
  // Log dans security_events
  await SecurityEvent.create({
    user_id: user.id,
    event_type: 'user_created',
    event_data: { email: user.email, role_id: user.role_id },
    ip_address: options.ipAddress || 'SYSTEM',
    user_agent: options.userAgent || 'API'
  });
  
  logSecurity(`User created: ${user.email}`);
});

User.beforeDestroy(async (user) => {
  // Soft delete: Vérifier pas d'écritures en cours
  const activeEntries = await JournalEntry.count({
    where: { created_by_id: user.id, status: 'DRAFT' },
    paranoid: false
  });
  
  if (activeEntries > 0) {
    throw new Error(`Cannot delete user with ${activeEntries} active journal entries`);
  }
  
  logSecurity(`User soft-deleted: ${user.email}`);
});
```

### Champs d'Audit
- `created_at`: Timestamp de création (automatique)
- `updated_at`: Timestamp dernière modification (automatique)
- `deleted_at`: Timestamp soft delete (automatique si paranoid=true)
- `last_login_at`: Tracking login
- `password_changed_at`: Tracking password change
- `audit_trails`: Table séparée avec TOUS les changes détaillés

### Événements Sécurité à Logger
```
- user_created: Création d'utilisateur
- user_login: Login réussi
- user_login_failed: Tentative login échouée
- user_logout: Logout utilisateur
- user_password_changed: Changement password
- user_2fa_enabled: 2FA activé
- user_2fa_disabled: 2FA désactivé
- user_activated: Utilisateur réactivé
- user_deactivated: Utilisateur désactivé
- user_deleted: User soft-deleted
- user_role_changed: Rôle modifié
```

## 🧪 Tests

### Unit Tests
```javascript
// cascade/tests/models/user.model.test.js

describe('User Model', () => {
  
  test('Create user with valid data', async () => {
    const user = await User.create({
      groupeEntrepriseId: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      roleId: 2
    });
    expect(user.id).toBeDefined();
    expect(user.password).not.toEqual('SecurePass123!'); // Hashed
  });
  
  test('Fail: duplicate email', async () => {
    await expect(User.create({
      groupeEntrepriseId: 1,
      email: 'duplicate@example.com',
      username: 'user1',
      password: 'Pass123!',
      roleId: 2
    })).rejects.toThrow();
  });
  
  test('Soft delete user', async () => {
    const user = await User.findByPk(1);
    await user.destroy();
    const deleted = await User.findByPk(1);
    expect(deleted).toBeNull(); // With paranoid=true
    const withParanoid = await User.findByPk(1, { paranoid: false });
    expect(withParanoid.deletedAt).not.toBeNull();
  });
  
  test('Password hashing on create', async () => {
    const user = await User.create({
      groupeEntrepriseId: 1,
      email: 'hash@test.com',
      username: 'hashtest',
      password: 'PlainPassword123!',
      roleId: 2
    });
    const isValid = await bcrypt.compare('PlainPassword123!', user.password);
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests
```javascript
// cascade/tests/integration/auth.flow.test.js

describe('Auth Flow Integration', () => {
  
  test('Full login flow', async () => {
    // 1. Create user
    const user = await User.create({ ... });
    
    // 2. POST /api/auth/login
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: plainPassword });
    
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(user.email);
    
    // 3. Verify last_login_at updated
    const updated = await User.findByPk(user.id);
    expect(updated.lastLoginAt).not.toBeNull();
  });
});
```

## 📈 Performance

### Indexes
```sql
-- Existants (obligatoires)
INDEX idx_users_email (email)
INDEX idx_users_groupe_entreprise_id (groupe_entreprise_id)
INDEX idx_users_role_id (role_id)
INDEX idx_users_is_active (is_active)

-- Composite (multi-colonne pour requêtes communes)
UNIQUE INDEX uq_users_email_groupe (email, groupe_entreprise_id, deleted_at)
```

### Requêtes Courantes
```javascript
// Find by email + groupe (login)
User.findOne({
  where: { email: 'user@example.com', groupeEntrepriseId: 1, isActive: true }
});

// Find by role dans groupe
User.findAll({
  where: { groupeEntrepriseId: 1, roleId: 2, isActive: true },
  attributes: ['id', 'email', 'firstName', 'lastName']
});

// Audit trail
User.findAll({
  where: { isActive: false },
  paranoid: false,
  include: [{ association: 'auditTrails', limit: 10 }]
});
```

### Query Optimization
- ✅ Toujours utiliser `attributes: ['col1', 'col2']` pour limiter colonnes
- ✅ Toujours filtrer `isActive: true` sauf audit
- ✅ Utiliser `paranoid: false` explicitement pour soft-deleted
- ❌ JAMAIS utiliser `findAll()` sans WHERE clause

## 📝 Statut Implémentation

### État Actuel
- ✅ Table créée et fonctionnelle (depuis début v2.0)
- ✅ Model Sequelize complet (`user.model.js`)
- ✅ Soft delete activé (paranoid: true)
- ✅ Authentification de base (login/logout)
- ⏳ Hooks: Partiellement implémentés
- ⏳ 2FA: Modèle non créé (à faire Phase 2)
- ⏳ Documentation complète: 🆕 Cette documentation!

### Checklist Alignement v2.2
- ✅ Table naming: `users` (English, Identité domain)
- ✅ Columns: snake_case (`groupe_entreprise_id`, NOT `groupeId`)
- ✅ ORM config: `underscored: true`, `timestamps: true`, `paranoid: true`
- ✅ FK naming: `{table}_id` pattern (`groupe_entreprise_id`, `role_id`)
- ✅ Soft delete: `deleted_at` column + paranoid mode
- ✅ Audit: `created_at`, `updated_at`, hooks implemented
- ⏳ Documentation: 🆕 Complete v2.2 template (THIS FILE!)

## 🎯 Prochaines Actions

1. **Phase 1**: ✅ Documentation complète (ce fichier)
2. **Phase 2**: Créer modèles manquants (groupeEntreprise, twoFactorAuth, etc.)
3. **Phase 3**: Compléter hooks pour audit trail
4. **Phase 4**: Frontend DTOs validation

---

**Domaine**: 🇬🇧 Identité & Sécurité  
**Criticité**: 🔴 CRITIQUE  
**Status**: ✅ Aligné v2.2  
**Last Updated**: 25 Janvier 2026  
**Reviewed**: Ready for Phase 1 validation
