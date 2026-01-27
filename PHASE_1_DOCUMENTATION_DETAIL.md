# 📚 PHASE 1 - DOCUMENTATION TABLES SPOFE v2.2

**Date**: 25 Janvier 2026  
**Durée Estimée**: 8-10 heures  
**Effort**: 30-45 minutes par table  
**Status**: 🟡 **PRÊT À DÉMARRER**

---

## 📋 TEMPLATE OBLIGATOIRE SPOFE v2.2

Chaque table doit avoir un fichier `/docs/tables/{table_name}.md` avec ce template EXACT:

```markdown
# Table: {TableName}

**Base de Données**: {table_name}  
**Domaine**: {Organisationnel|Identité & Sécurité|Comptabilité OHADA|Audit & Traçabilité|Consultants}  
**Créée**: {date}  
**Dernière Mise à Jour**: {date}

---

## 🎯 Rôle Métier

[Description FR du rôle business dans SPOFE]

### Exemples d'Utilisation
- Exemple 1
- Exemple 2
- Exemple 3

---

## ⚠️ Criticité & Caractéristiques

| Aspect | Valeur |
|--------|--------|
| **Criticité** | 🔴 Critique / 🟠 Important / 🟡 Moyen / 🟢 Bas |
| **Multi-Tenant** | ✅ Oui (groupe_id) / ❌ Non (globale) |
| **Auditée** | ✅ Oui (audit_trails) / ❌ Non |
| **Soft Delete** | ✅ Oui (deleted_at) / ❌ Non |
| **Données Sensibles** | ✅ Chiffré / ⚠️ Partielles / ❌ Non |
| **High Frequency** | ✅ Oui (100+/jour) / ⚠️ Moyen / ❌ Non |

---

## 📊 Structure de la Table

### Colonnes Clés

| Colonne | Type | Nullable | Unique | Clé | Description |
|---------|------|----------|--------|-----|-------------|
| id | INT | ❌ | ✅ | PK | Identifiant unique auto-incrémenté |
| {column_name} | {type} | ❌/✅ | ❌/✅ | FK? | Description détaillée |
| created_at | TIMESTAMP | ❌ | ❌ | - | Création (auto Sequelize) |
| updated_at | TIMESTAMP | ❌ | ❌ | - | Dernière modif (auto Sequelize) |
| deleted_at | TIMESTAMP | ✅ | ❌ | - | Soft delete (si paranoid) |

### Indices

```sql
-- Clé Primaire
PRIMARY KEY (id)

-- Clés Étrangères
FOREIGN KEY (user_id) REFERENCES users(id)
FOREIGN KEY (compagnie_id) REFERENCES compagnies(id)

-- Indices de Performance
INDEX idx_{table_name}_{field} (field)
INDEX idx_{table_name}_created_at (created_at)

-- Unique Constraints
UNIQUE KEY uk_{table_name}_{field} (field)
```

---

## 🔗 Dépendances & Associations

### Associations Entrantes (Qui référence cette table)

- `{OtherTable}` → {ForeignKey}
- `{OtherTable2}` → {ForeignKey}

### Associations Sortantes (Que référence cette table)

- `{ReferencedTable}` via {ForeignKey}
- `{ReferencedTable2}` via {ForeignKey}

### Modèle Sequelize

```javascript
// cascade/src/models/{TableName}.model.js
const {TableName} = sequelize.define('{TableName}', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // ... columns
}, {
  tableName: '{table_name}',
  underscored: true,
  timestamps: true,
  paranoid: {true|false},  // soft delete
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Associations
{TableName}.belongsTo(models.User, { foreignKey: 'user_id' });
{TableName}.belongsTo(models.Compagnie, { foreignKey: 'compagnie_id' });
```

---

## 🚨 Règles Métier OHADA

### Validations
- Règle 1: {description}
- Règle 2: {description}
- Règle 3: {description}

### États & Transitions
```
[État 1] → [État 2] → [État 3]
  ├─ Condition 1
  ├─ Action post-transition
  └─ Audit recording: OUI
```

### Nomenclature OHADA (si comptable)
- Classe: {OHADA class}
- Type: {OHADA type}
- Code Format: {format_regex}

---

## 🔐 Sécurité & Conformité

### Données Sensibles
- ❌ Aucune (données standard)
- ⚠️ {Colonne sensible}: Accès limité à {rôle}
- ✅ {Colonne sensible}: Chiffré en BD

### Règles d'Accès
- Administrateur: ✅ Lecture/Écriture/Suppression
- Super Utilisateur: ✅ Lecture/Écriture
- Utilisateur: ✅ Lecture (filtrée par compagnie)
- Consultant: ⚠️ Lecture (données assignées)

### Audit Trail
- Créations: ✅ Enregistrées
- Modifications: ✅ Enregistrées + undo possible
- Suppressions: ✅ Soft delete tracé

---

## 📈 Performance

### Volume Typique
- Nombre de lignes (prod): {estimé}
- Croissance: {n} lignes/mois
- Partition recommandée: {si applicable}

### Requêtes Fréquentes
```javascript
// Query 1: Description
Model.findAll({
  where: { status: 'active' },
  include: [{ model: RelatedModel }],
  limit: 10
});

// Query 2: Description avec index
Model.findOne({
  where: { unique_field: value }
});
```

### Optimisations Appliquées
- ✅ Index sur {field}
- ✅ Scope par défaut excluant soft-deleted
- ✅ Eager loading des associations

---

## 📋 Changements Récents

### Migrations
- Migration 1: {date} - {description}
- Migration 2: {date} - {description}

### Breaking Changes
- ❌ Aucun changement breaking
- ⚠️ Renommage: {ancien} → {nouveau}

---

## 🔗 Références

- **Documentation métier**: [path_if_exists]
- **Standards OHADA**: [OHADA code reference]
- **Related Tables**: [{table1}, {table2}]
- **Frontend Forms**: [{component1}, {component2}]
- **API Endpoints**: [GET /api/{table_name}, POST /api/{table_name}]

---

## ✅ Checklist Conformité v2.2

- ☐ Nom table: snake_case
- ☐ Clés étrangères: {table}_id
- ☐ Timestamps: created_at, updated_at
- ☐ Soft delete: deleted_at (si paranoid)
- ☐ Modèle Sequelize: underscored: true, timestamps: true
- ☐ Indices: PK, FK, performance
- ☐ Associations: bidirectionnelles mappées
- ☐ Sécurité: accès contrôlés
- ☐ Audit: changements tracés
- ☐ Documentation: 100% complète

---

*Last Updated: 25 Janvier 2026*  
*Conforme à SPOFE v2.2*
```

---

## 📑 TABLES À DOCUMENTER (14 TABLES)

### Liste Complète avec Priorités

#### 🔴 CRITIQUE (Jour 1-2)

| # | Table | Domaine | Status | Effort | Priorité |
|---|-------|---------|--------|--------|----------|
| 1 | users | Identité & Sécurité | ⏳ | 45 min | 🔴 |
| 2 | compagnies | Organisationnel | ⏳ | 40 min | 🔴 |
| 3 | roles | Identité & Sécurité | ⏳ | 35 min | 🔴 |
| 4 | groupes_entreprises | Organisationnel | ⏳ | 40 min | 🔴 |
| 5 | charts_of_accounts | Comptabilité | ⏳ | 45 min | 🔴 |

#### 🟠 IMPORTANT (Jour 3)

| 6 | journal_entries | Comptabilité | ⏳ | 45 min | 🟠 |
| 7 | journal_entry_lines | Comptabilité | ⏳ | 45 min | 🟠 |
| 8 | account_balances | Comptabilité | ⏳ | 40 min | 🟠 |
| 9 | audit_trails | Audit | ⏳ | 35 min | 🟠 |
| 10 | security_events | Audit | ⏳ | 35 min | 🟠 |

#### 🟡 MOYEN (Jour 4-5)

| 11 | two_factor_auths | Identité & Sécurité | ⏳ | 30 min | 🟡 |
| 12 | password_reset_tokens | Identité & Sécurité | ⏳ | 30 min | 🟡 |
| 13 | token_blacklists | Identité & Sécurité | ⏳ | 30 min | 🟡 |
| 14 | app_settings | Organisationnel | ⏳ | 30 min | 🟡 |

---

## 🎯 GUIDE PAR TABLE

### 1️⃣ users (Identité & Sécurité) - 45 min

**Description Métier**:  
Table d'authentification centralisée pour tous les accès SPOFE. Contient profil utilisateur, credentials, et flags d'activité. Multi-tenant via groupe_id.

**Colonnes Clés**:
- `id`: PK
- `groupe_id`: FK → groupes_entreprises(id) [Multi-tenant]
- `username`: Unique, utilisé login
- `email`: Unique, récupération password
- `password`: Chiffré bcrypt
- `role`: ENUM admin/super_utilisateur/utilisateur
- `is_active`: Boolean activation
- `created_at`, `updated_at`, `deleted_at`: Timestamps + soft delete

**Modèle Sequelize**: DÉJÀ EXISTANT ✅
```javascript
// cascade/src/models/user.model.js
paranoid: true ✅
underscored: true ✅
timestamps: true ✅
```

**Dépendances**: 
- Entrantes: roles (user_id), two_factor_auths (user_id), audit_trails (user_id), journal_entries (created_by_id)
- Sortantes: groupes_entreprises (groupe_id)

**Règles Métier**:
- Username unique par groupe_id
- Email unique globalement (pour reset password)
- Suppression cascade à 2FA, tokens
- Audit de création/modification

---

### 2️⃣ compagnies (Organisationnel) - 40 min

**Description Métier**:  
Entités légales (entreprises) gérées dans SPOFE. Chaque compagnie a ses propres comptes, journaux, et balances. Multi-tenant via groupe_id.

**Colonnes Clés** (après fusion companies → compagnies):
- `id`: PK
- `groupe_id`: FK → groupes_entreprises(id)
- `code`: Unique code comptable
- `name`: Nom légal
- `registration_number`: Numéro RCCM/NIIF
- `tax_id`: Numéro fiscal
- `address`, `postal_code`, `phone`, `email`, `website`: Coordonnées
- `accounting_standard`: ENUM ohada/ifrs/us_gaap
- `created_at`, `updated_at`, `deleted_at`: Timestamps

**État Migration**: 
- ✅ Table companies fusée intelligemment
- ✅ 6 colonnes nouvelles ajoutées
- ✅ FKs remappées en BD
- ✅ 0 data loss

**Dépendances**:
- Entrantes: users (compagnie_id), journal_entries, charts_of_accounts, third_parties
- Sortantes: groupes_entreprises (groupe_id)

---

### 3️⃣ roles (Identité & Sécurité) - 35 min

**Description Métier**:  
Définition des rôles SPOFE. Contrôle granulaire des permissions par rôle. Multi-tenant via compagnie_id.

**Colonnes Clés**:
- `id`: PK
- `compagnie_id`: FK → compagnies(id) [Si ∅: globale]
- `name`: Unique par compagnie
- `description`: Permissions description
- `permissions`: JSON {read, write, delete, approve...}
- `created_at`, `updated_at`, `deleted_at`: Timestamps

**Dépendances**:
- Entrantes: users (role_id)
- Sortantes: compagnies (compagnie_id)

---

### 4️⃣ groupes_entreprises (Organisationnel) - 40 min

**Description Métier**:  
Racine organisationnelle. Chaque groupe contient N compagnies. Isolation données garantie entre groupes. Nouveau en v2.1.

**Colonnes Clés**:
- `id`: PK
- `code`: Unique identifiant groupe
- `name`: Nom groupe
- `country`: Pays principal
- `currency`: Devise par défaut
- `fiscal_year_end`: Fin exercice fiscal
- `created_at`, `updated_at`, `deleted_at`: Timestamps

**Dépendances**:
- Entrantes: compagnies (groupe_id), users (groupe_id)
- Sortantes: aucune

---

### 5️⃣ charts_of_accounts (Comptabilité OHADA) - 45 min

**Description Métier**:  
Plan comptable hiérarchique OHADA. Chaque compte a classe, type, numéro. Multi-tenant via compagnie_id.

**Colonnes Clés** (colonnes FR nomenclature OHADA):
- `id`: PK
- `compagnie_id`: FK → compagnies(id)
- `numero_compte`: Unique par compagnie (ex: 101, 511020)
- `libelle_compte`: Désignation compte OHADA
- `classe_ohada`: 1-8 ou 9
- `type_compte`: Actif/Passif/Résultat/Gestion
- `parent_account_id`: FK → self (hiérarchie)
- `is_active`: Flag statut
- `created_at`, `updated_at`, `deleted_at`: Timestamps

**Standards OHADA**:
- Classes: 1(Capitaux) 2(Actif Fixe) 3(Stocks) 4(Tiers) 5(Financiers) 6(Charges) 7(Produits) 8(Analytique) 9(Budget)
- Hiérarchie respectée: 1xx.xxx format

**Dépendances**:
- Entrantes: journal_entry_lines (account_id), account_balances (account_id)
- Sortantes: compagnies (compagnie_id), self (parent_account_id)

---

### 6️⃣ journal_entries (Comptabilité OHADA) - 45 min

**Description Métier**:  
Écritures comptables (journaux). Chaque écriture référence compagnie + statut workflow (DRAFT → POSTED). Immutable post-publication.

**Colonnes Clés**:
- `id`: PK
- `compagnie_id`: FK → compagnies(id)
- `reference`: Unique (ex: JNL-2026-001)
- `numero_journal`: Code journal (VT, AC, TR, OP...)
- `date_operation`: Date écriture
- `date_comptable`: Date comptabilité
- `statut`: ENUM DRAFT/SUBMITTED/APPROVED/POSTED/REVERSED (workflow)
- `description`: Motif écriture
- `montant_total`: Somme débits = crédits
- `created_by_id`: FK → users(id)
- `created_at`, `updated_at`, `deleted_at`: Timestamps (paranoid!)

**Workflow d'État**:
```
DRAFT → SUBMITTED → APPROVED → POSTED → REVERSED (soft delete)
  ├─ DRAFT: Création, édition libre
  ├─ SUBMITTED: Soumis approbation
  ├─ APPROVED: Approuvé, prêt à poster
  ├─ POSTED: Publié (immutable sauf reversal)
  └─ REVERSED: Contrepassée (création auto écriture inverse)
```

**Dépendances**:
- Entrantes: journal_entry_lines (journal_entry_id), audit_trails (record_id)
- Sortantes: compagnies, users (created_by_id)

---

### 7️⃣ journal_entry_lines (Comptabilité OHADA) - 45 min

**Description Métier**:  
Lignes atomiques d'écritures (lignes débit/crédit). Représente mouvements comptables. Équilibre garanti: Σ débits = Σ crédits.

**Colonnes Clés**:
- `id`: PK
- `journal_entry_id`: FK → journal_entries(id)
- `account_id`: FK → charts_of_accounts(id)
- `debit_amount`: Montant débit (ou 0.00)
- `credit_amount`: Montant crédit (ou 0.00)
- `description`: Détail ligne
- `line_number`: Ordre ligne
- `created_at`, `updated_at`: Timestamps

**Invariants Métier**:
- Debit_amount XOR credit_amount (pas les deux)
- Montants positifs uniquement
- Somme débits = Somme crédits (au niveau journal_entry)
- Comptes acceptent débits ET crédits (pas de "compte débiteur only")

**Dépendances**:
- Entrantes: aucune
- Sortantes: journal_entries, charts_of_accounts

---

### 8️⃣ account_balances (Comptabilité OHADA) - 40 min

**Description Métier**:  
Balances cumulées par période (mois/trimestre/année). Denormalisé pour performance reporting. Calculé via journal_entry_lines.

**Colonnes Clés**:
- `id`: PK
- `compagnie_id`: FK → compagnies(id)
- `account_id`: FK → charts_of_accounts(id)
- `fiscal_period`: Format YYYY-MM (ex: 2026-01)
- `opening_balance`: Solde ouverture période
- `debit_movements`: Σ débits période
- `credit_movements`: Σ crédits période
- `closing_balance`: Solde clôture (opening ± mouvements)
- `created_at`, `updated_at`: Timestamps

**Calcul**:
```
closing_balance = opening_balance + debit_movements - credit_movements
```

**Dépendances**:
- Entrantes: aucune (calculée)
- Sortantes: compagnies, charts_of_accounts

---

### 9️⃣ audit_trails (Audit & Traçabilité) - 35 min

**Description Métier**:  
Journal d'audit complet des changements. Trace TOUS les CREATE/UPDATE/DELETE. Non-répudiable.

**Colonnes Clés**:
- `id`: PK
- `user_id`: FK → users(id)
- `compagnie_id`: FK → compagnies(id)
- `table_name`: Nom table modifiée
- `record_id`: PK de l'enregistrement
- `operation`: ENUM CREATE/UPDATE/DELETE
- `old_values`: JSON avant changement
- `new_values`: JSON après changement
- `ip_address`: IP utilisateur
- `user_agent`: User-Agent browser
- `created_at`: Timestamp immuable

**Immuabilité**:
- ❌ UPDATE jamais sur audit_trails
- ❌ DELETE jamais sur audit_trails
- ✅ Renouvellement automatique par triggers si BD le supporte

**Dépendances**:
- Entrantes: automatisé par hooks
- Sortantes: users, compagnies

---

### 🔟 security_events (Audit & Traçabilité) - 35 min

**Description Métier**:  
Événements de sécurité (login, 2FA, failed auth, permission denied). Alertes proactives.

**Colonnes Clés**:
- `id`: PK
- `user_id`: FK → users(id) [NULL si guest]
- `event_type`: ENUM login_success/login_failed/2fa_enabled/permission_denied/data_export
- `severity`: ENUM info/warning/critical
- `ip_address`: IP origine
- `description`: Détail événement
- `is_reviewed`: Flag revue
- `created_at`: Timestamp

**Événements Critiques** (triggering alerts):
- 5× login_failed en 10min → Alerte
- 2fa_disabled → Alerte immédiate
- permission_denied → Log seulement
- data_export → Log + audit trail

**Dépendances**:
- Entrantes: aucune
- Sortantes: users

---

### 1️⃣1️⃣ two_factor_auths (Identité & Sécurité) - 30 min

**Description Métier**:  
2FA secrets (TOTP). Un par utilisateur. Backup codes pour récupération.

**Colonnes Clés**:
- `id`: PK
- `user_id`: FK → users(id)
- `secret`: Clé TOTP chiffrée
- `backup_codes`: JSON array 8 codes
- `is_enabled`: Flag activé
- `enabled_at`: Timestamp activation
- `created_at`, `updated_at`: Timestamps

**Sécurité**:
- ✅ Secret chiffré AES-256
- ✅ Codes single-use (marqués used)
- ✅ Backup codes pour recovery

**Dépendances**:
- Entrantes: aucune
- Sortantes: users

---

### 1️⃣2️⃣ password_reset_tokens (Identité & Sécurité) - 30 min

**Description Métier**:  
Jetons réinitialisation password. Single-use, expiration 1h.

**Colonnes Clés**:
- `id`: PK
- `user_id`: FK → users(id)
- `token`: Hash jeton (jamais en plain text!)
- `expires_at`: Expiration 1h
- `is_used`: Flag consommé
- `used_at`: Timestamp utilisation
- `created_at`: Timestamp création

**Sécurité**:
- ✅ Token généré crypto.randomBytes(32).toString('hex')
- ✅ Hash stocké (SHA-256)
- ✅ Single-use enforcement
- ✅ Expiration stricte

**Dépendances**:
- Entrantes: aucune
- Sortantes: users

---

### 1️⃣3️⃣ token_blacklists (Identité & Sécurité) - 30 min

**Description Métier**:  
JWT revocation sur logout. Empêche réutilisation après déconnexion.

**Colonnes Clés**:
- `id`: PK
- `user_id`: FK → users(id)
- `token`: JWT payload (sub, iat, exp)
- `expires_at`: Quand le JWT expire naturellement
- `revoked_at`: Timestamp revocation
- `reason`: ENUM logout/password_change/admin_revoke
- `created_at`: Timestamp

**Gestion Durée Vie**:
- Entrées purgées après `expires_at` + 1h (grace period)
- Cron job quotidien pour cleanup

**Dépendances**:
- Entrantes: aucune
- Sortantes: users

---

### 1️⃣4️⃣ app_settings (Organisationnel) - 30 min

**Description Métier**:  
Configuration globale de l'application. Clé-valeur non-relation. Cachée Redis.

**Colonnes Clés**:
- `id`: PK
- `key`: Unique identifiant (ex: `smtp_host`, `logo_url`, `language_default`)
- `value`: JSON (string/number/boolean)
- `description`: Explication
- `group`: Catégorie (email/ui/security/api)
- `is_secret`: Flag sécurité (masqué logs si true)
- `created_at`, `updated_at`: Timestamps

**Exemples Clés**:
```
email_smtp_host → smtp.office365.com
email_smtp_port → 587
email_from → noreply@spofe.app
logo_url → /img/logo.png
report_language → fr_FR
max_login_attempts → 5
```

**Caching**:
- ✅ Redis cache: TTL 1h
- ✅ Invalidation on update
- ✅ Fallback BD si cache miss

**Dépendances**:
- Entrantes: aucune
- Sortantes: aucune

---

## 📅 CALENDRIER EXÉCUTION

### Jour 1 (5 tables, 4h)
```
09:00-09:45 : users.md (création)
09:45-10:30 : compagnies.md
10:30-11:00 : Pause
11:00-11:35 : roles.md
11:35-12:15 : groupes_entreprises.md
12:15-13:15 : Déjeuner
13:15-14:00 : charts_of_accounts.md
14:00       : Relecture templates Jour 1
```

### Jour 2 (5 tables, 4h)
```
09:00-09:45 : journal_entries.md
09:45-10:30 : journal_entry_lines.md
10:30-11:00 : Pause
11:00-11:40 : account_balances.md
11:40-12:15 : audit_trails.md
12:15-13:15 : Déjeuner
13:15-13:50 : security_events.md
14:00       : Relecture templates Jour 2
```

### Jour 3 (4 tables, 2h)
```
09:00-09:30 : two_factor_auths.md
09:30-10:00 : password_reset_tokens.md
10:00-10:30 : token_blacklists.md
10:30-11:00 : app_settings.md
11:00       : Relecture complète + tests
11:30       : Signature documents
```

**Total**: 3 jours × 6h = 18h = Fin Jeudi soir  
**Buffer**: Vendredi matin pour ajustements

---

## ✅ VALIDATION DOCUMENTATION

### Tests par Table

```bash
# Test 1: Markdown syntax valide
npm run test:docs:syntax

# Test 2: Modèles Sequelize matchent docs
npm run test:docs:models-align

# Test 3: Tables en BD existent
npm run test:docs:db-exists

# Test 4: Links internes OK
npm run test:docs:links

# Test 5: Colonnes documentées = colonnes réelles
npm run test:docs:columns-complete
```

### Checklist Review

- ☐ Tous templates remplis
- ☐ Markdown valide (lint)
- ☐ Liens internes OK
- ☐ Nomenclature cohérente
- ☐ Exemples pertinents
- ☐ Formats données justes
- ☐ Dépendances mappées
- ☐ Règles métier documentées

---

## 🎯 DELIVERABLES

### Fin Jour 1
✅ /docs/tables/users.md  
✅ /docs/tables/compagnies.md  
✅ /docs/tables/roles.md  
✅ /docs/tables/groupes_entreprises.md  
✅ /docs/tables/charts_of_accounts.md  

### Fin Jour 2
✅ /docs/tables/journal_entries.md  
✅ /docs/tables/journal_entry_lines.md  
✅ /docs/tables/account_balances.md  
✅ /docs/tables/audit_trails.md  
✅ /docs/tables/security_events.md  

### Fin Jour 3
✅ /docs/tables/two_factor_auths.md  
✅ /docs/tables/password_reset_tokens.md  
✅ /docs/tables/token_blacklists.md  
✅ /docs/tables/app_settings.md  
✅ /docs/INDEX.md (index centralisé)  
✅ Tests complets passent  

---

## 🚀 PROCHAINES PHASES

Après Phase 1 (Documentation) ✅:

### Phase 2: Modèles Sequelize (6-8h)
- Vérifier tous modèles existants vs template
- Ajouter modèles manquants (consultant tables)
- Configurer hooks (beforeCreate, beforeUpdate, afterCreate)

### Phase 3: Hooks Audit (4-6h)
- Audit trail automatique
- Security events logging
- Data validation hooks

### Phase 4: Frontend Integration (4-6h)
- Vérifier DTOs mapping
- Tester validation
- Aligner API calls

---

**Status**: 🟡 **PRÊT À DÉMARRER PHASE 1**  
**Prochaine Action**: Créer /docs/tables directory et commencer Day 1
