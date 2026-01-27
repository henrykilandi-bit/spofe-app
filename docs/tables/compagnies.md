# Table: `compagnies` (anciennement `companies`)

## 🎯 Rôle Métier

Référentiel des entités juridiques/sociétés enregistrées dans le système SPOFE. Chaque compagnie appartient à un groupe d'entreprises (structure multi-locataire) et possède ses propres livres comptables, paramètres et configuration OHADA.

**Domaine**: 🇫🇷 Organisationnel (French naming per SPOFE v2.2)

## 🔴 Criticité

**CRITIQUE** - Unité fondamentale de l'application
- C'est le conteneur pour tous les livres comptables
- Impact erreur: Écritures comptables orphelines, perte d'intégrité financière
- Dépendances sortantes: 10+ tables (journal_entries, accounts, balances, etc.)
- Récupérabilité: HAUTE (soft delete activé)

## 📋 Structure

### Colonnes

```sql
CREATE TABLE compagnies (
  id                        INT PRIMARY KEY AUTO_INCREMENT,
  groupe_entreprise_id      INT NOT NULL,              -- FK vers groupes_entreprises
  code                      VARCHAR(20) UNIQUE NOT NULL, -- Code interne (BEN, SEN, etc.)
  name                      VARCHAR(255) NOT NULL,    -- Nom de la compagnie
  legal_name                VARCHAR(255),             -- Dénomination légale exacte
  tax_id                    VARCHAR(50),              -- Numéro d'identification fiscale
  registration_number       VARCHAR(50),              -- Registre commercial
  country                   VARCHAR(2) DEFAULT 'BJ',  -- Code pays (ISO 3166-1 alpha-2)
  currency                  VARCHAR(3) DEFAULT 'XOF', -- Devise principale (ISO 4217)
  fiscal_year_end           INT DEFAULT 31,           -- Jour fin d'exercice (1-31, 31=31-12)
  accounting_standard       ENUM('OHADA', 'IFRS', 'GAAP') DEFAULT 'OHADA', -- Norme comptable
  chart_of_accounts_id      INT,                      -- FK vers charts_of_accounts (défaut)
  is_active                 BOOLEAN DEFAULT TRUE,     -- Activation/Désactivation
  postal_code               VARCHAR(20),              -- Code postal
  phone                     VARCHAR(20),              -- Téléphone principal
  email                     VARCHAR(255),             -- Email principal
  website                   VARCHAR(255),             -- Site web
  headquarters_address      TEXT,                     -- Adresse du siège
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at                TIMESTAMP NULL,           -- Soft delete (paranoid mode)
  
  -- Constraints
  CONSTRAINT fk_compagnies_groupe_entreprise 
    FOREIGN KEY (groupe_entreprise_id) REFERENCES groupes_entreprises(id) ON DELETE RESTRICT,
  CONSTRAINT fk_compagnies_chart_of_accounts 
    FOREIGN KEY (chart_of_accounts_id) REFERENCES charts_of_accounts(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_compagnies_groupe_entreprise_id (groupe_entreprise_id),
  INDEX idx_compagnies_code (code),
  INDEX idx_compagnies_is_active (is_active),
  UNIQUE INDEX uq_compagnies_code_groupe (code, groupe_entreprise_id, deleted_at)
);

ALTER TABLE compagnies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Schéma ORM (Sequelize)

```javascript
// cascade/src/models/compagnie.model.js (ancien: company.model.js)
const Compagnie = sequelize.define('Compagnie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  groupeEntrepriseId: { type: DataTypes.INTEGER, allowNull: false, field: 'groupe_entreprise_id' },
  code: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  legalName: { type: DataTypes.STRING(255), field: 'legal_name' },
  taxId: { type: DataTypes.STRING(50), field: 'tax_id' },
  registrationNumber: { type: DataTypes.STRING(50), field: 'registration_number' },
  country: { type: DataTypes.STRING(2), defaultValue: 'BJ', field: 'country' },
  currency: { type: DataTypes.STRING(3), defaultValue: 'XOF' },
  fiscalYearEnd: { type: DataTypes.INTEGER, defaultValue: 31, field: 'fiscal_year_end' },
  accountingStandard: { type: DataTypes.ENUM('OHADA', 'IFRS', 'GAAP'), defaultValue: 'OHADA', field: 'accounting_standard' },
  chartOfAccountsId: { type: DataTypes.INTEGER, field: 'chart_of_accounts_id' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  postalCode: { type: DataTypes.STRING(20), field: 'postal_code' },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(255) },
  website: { type: DataTypes.STRING(255) },
  headquartersAddress: { type: DataTypes.TEXT, field: 'headquarters_address' }
}, {
  tableName: 'compagnies',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});
```

## 🔗 Dépendances

### Foreign Keys Sortantes
```
→ groupes_entreprises(id)  [FK] groupe_entreprise_id (REQUIRED, RESTRICT)
→ charts_of_accounts(id)   [FK] chart_of_accounts_id (OPTIONAL, SET NULL)
```

### Foreign Keys Entrantes
```
← journal_entries(compagnie_id)        [FK] Écritures par compagnie
← charts_of_accounts(compagnie_id)    [FK] Plan comptable par compagnie
← account_balances(compagnie_id)      [FK] Soldes par compagnie
← third_parties(compagnie_id)         [FK] Tiers de la compagnie
```

### Associations Bidirectionnelles
```javascript
// Compagnie.js
Compagnie.belongsTo(GroupeEntreprise, { foreignKey: 'groupeEntrepriseId' });
Compagnie.belongsTo(ChartOfAccount, { foreignKey: 'chartOfAccountsId' });
Compagnie.hasMany(JournalEntry, { foreignKey: 'compagnieId' });
Compagnie.hasMany(ChartOfAccount, { foreignKey: 'compagnieId' });
Compagnie.hasMany(AccountBalance, { foreignKey: 'compagnieId' });
Compagnie.hasMany(ThirdParty, { foreignKey: 'compagnieId' });
```

## 📏 Règles Métier

### Validation Données
```javascript
// Code compagnie: Alphanumeric, 2-20 chars
const codeRegex = /^[A-Z0-9]{2,20}$/;

// Name: Required, min 3 chars
// Country: ISO 3166-1 alpha-2 code
// Currency: ISO 4217 code
// Fiscal year end: 1-31 (jour du mois)
// Accounting standard: OHADA | IFRS | GAAP
```

### Règles Métier
- ✅ Multi-locataire: Affiliée à 1 groupe OBLIGATOIRE
- ✅ Unicité code: Par groupe d'entreprise (même code possible dans autre groupe si soft-deleted)
- ✅ Plan comptable: Peut partager ou avoir le sien (chartOfAccountsId)
- ✅ Devise: Immutable après création (impact écritures)
- ✅ Fiscal year end: Jour fixe (jour de l'exercice comptable)
- ✅ Activation: Peut être désactivée (is_active=false)

### Transitions d'État
```
CREATED (is_active=true)
  ↓ [Admin désactivation]
INACTIVE (is_active=false, écritures bloquées)
  ↓ [Admin réactivation]
ACTIVE
  ↓ [Soft delete]
DELETED (deleted_at IS NOT NULL)
```

## 🔐 Sécurité

### Autorisation
- ✅ Utilisateurs: Accès limité à compagnies du même groupe
- ✅ Admins: Accès à toutes compagnies du groupe
- ✅ Super-admins: Accès à toutes compagnies

### Audit
- ✅ Tous les changes: Enregistrés dans `audit_trails`
- ✅ Modifications sensibles: Enregistrées dans `security_events`
- ✅ Colonnes sensibles: `tax_id`, `registration_number`

## 📊 Audit & Traçabilité

### Hooks (Sequelize)

```javascript
// cascade/src/models/compagnie.model.js

Compagnie.beforeCreate(async (compagnie) => {
  // Validation code format
  if (!/^[A-Z0-9]{2,20}$/.test(compagnie.code)) {
    throw new Error('Code must be 2-20 uppercase alphanumeric');
  }
  
  // Normalisation
  compagnie.code = compagnie.code.toUpperCase();
  compagnie.country = compagnie.country.toUpperCase();
  compagnie.currency = compagnie.currency.toUpperCase();
  
  logInfo(`Compagnie.beforeCreate: ${compagnie.code}`);
});

Compagnie.beforeUpdate(async (compagnie) => {
  // Prevent certain field changes
  if (compagnie.changed('currency')) {
    const journalCount = await JournalEntry.count({
      where: { compagnieId: compagnie.id }
    });
    if (journalCount > 0) {
      throw new Error('Cannot change currency after journal entries created');
    }
  }
  
  logInfo(`Compagnie.beforeUpdate: ${compagnie.code}`);
});

Compagnie.afterCreate(async (compagnie, options) => {
  await SecurityEvent.create({
    user_id: options.userId,
    event_type: 'compagnie_created',
    event_data: { code: compagnie.code, name: compagnie.name },
    ip_address: options.ipAddress,
    user_agent: options.userAgent
  });
});
```

### Événements Sécurité
```
- compagnie_created: Création compagnie
- compagnie_updated: Modification compagnie
- compagnie_activated: Réactivation
- compagnie_deactivated: Désactivation
- compagnie_currency_changed: Changement devise (DANGER!)
- compagnie_deleted: Soft delete
```

## 🧪 Tests

```javascript
// cascade/tests/models/compagnie.model.test.js

describe('Compagnie Model', () => {
  
  test('Create compagnie with valid data', async () => {
    const comp = await Compagnie.create({
      groupeEntrepriseId: 1,
      code: 'BEN',
      name: 'Bénin Operations',
      country: 'BJ',
      currency: 'XOF'
    });
    expect(comp.id).toBeDefined();
    expect(comp.code).toBe('BEN');
  });
  
  test('Fail: invalid code format', async () => {
    await expect(Compagnie.create({
      groupeEntrepriseId: 1,
      code: 'invalid-code',
      name: 'Test',
      country: 'BJ',
      currency: 'XOF'
    })).rejects.toThrow();
  });
  
  test('Prevent currency change after entries', async () => {
    const comp = await Compagnie.findByPk(1);
    // Create journal entry
    await JournalEntry.create({ compagnieId: 1, /* ... */ });
    
    await expect(
      comp.update({ currency: 'USD' })
    ).rejects.toThrow('Cannot change currency');
  });
  
  test('Soft delete compagnie', async () => {
    const comp = await Compagnie.findByPk(1);
    await comp.destroy();
    const deleted = await Compagnie.findByPk(1);
    expect(deleted).toBeNull(); // paranoid=true
  });
});
```

## 📈 Performance

### Indexes
```sql
INDEX idx_compagnies_groupe_entreprise_id (groupe_entreprise_id)
INDEX idx_compagnies_code (code)
INDEX idx_compagnies_is_active (is_active)
UNIQUE INDEX uq_compagnies_code_groupe (code, groupe_entreprise_id, deleted_at)
```

## 📝 Statut Implémentation

### État Actuel
- ✅ Table créée (post-fusion depuis `companies`)
- ✅ 6 colonnes nouvelles ajoutées
- ⏳ Model renommé: `company.model.js` → `compagnie.model.js` (Phase 2)
- ⏳ Hooks: À compléter (Phase 3)
- ⏳ Documentation: 🆕 Cette documentation!

### Checklist Alignement v2.2
- ✅ Table naming: `compagnies` (French, Organisationnel domain)
- ✅ Columns: snake_case
- ✅ ORM config: `underscored: true`, `timestamps: true`, `paranoid: true`
- ✅ FK naming: `groupe_entreprise_id`, `chart_of_accounts_id`
- ✅ Soft delete: Activé
- ⏳ Documentation: 🆕 Complete v2.2 template

---

**Domaine**: 🇫🇷 Organisationnel  
**Criticité**: 🔴 CRITIQUE  
**Status**: ✅ Aligné v2.2 (post-fusion)  
**Last Updated**: 25 Janvier 2026
