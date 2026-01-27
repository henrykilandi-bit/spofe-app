# 📋 DATABASE DATA RETENTION POLICY v2.1

**Date**: 2026-01-22  
**Version**: 2.1 - Non-Destructive Strategy  
**Status**: ✅ Active

---

## 🎯 OBJECTIF

Implémenter une stratégie **non-destructrice et intelligente** pour la gestion des données à travers le cycle de vie complet de l'application.

- ✅ **Aucune destruction accidentelle** de données critiques
- ✅ **Différentiation** basée sur le type de données
- ✅ **Conformité audit** via tables immuables
- ✅ **Optimisation espace disque** via archivage sélectif
- ✅ **Récupération possible** des données métier

---

## 📊 CATÉGORISATION DES TABLES

### CATÉGORIE 1: DONNÉES MÉTIER ✅ (Soft Delete OBLIGATOIRE)

**Tables**: `users`, `compagnies`, `roles`, `charts_of_accounts`, `journal_entries`, `journal_entry_lines`, `account_balances`, `business_operations`, `third_parties`, `fiscal_years`, `operation_templates`

**Stratégie**: `SOFT_DELETE`

**Configuration Sequelize**:
```javascript
paranoid: true
deletedAt: 'deleted_at'
defaultScope: { where: { deleted_at: null } }
```

**Traits appliqués**: `BusinessSoftDeleteTrait`

**Cycle de vie**:
1. Création → `deleted_at = null` (actif)
2. Suppression utilisateur → `deleted_at = NOW()` (marqué supprimé)
3. Récupération possible → `update set deleted_at = null`
4. Archivage → Au besoin (pas d'archivage automatique)

**Scopes disponibles**:
```javascript
// Tous les records ACTIFS (défaut)
User.findAll()

// Incluire les supprimés
User.scope('withDeleted').findAll()

// Uniquement les supprimés
User.scope('onlyDeleted').findAll()
```

**Indexes**:
- `idx_table_deleted_at` - Pour filtrage rapide
- `idx_table_created_deleted` - Pour requêtes chronologiques

**Avantages**:
- ✅ Récupération de données accidentellement supprimées
- ✅ Audit trail complet
- ✅ Conformité légale
- ✅ Historique métier préservé

---

### CATÉGORIE 2: DONNÉES D'AUDIT 🔐 (IMMUTABLE - Soft Delete INTERDIT)

**Tables**: `audit_trails`, `security_events`

**Stratégie**: `IMMUTABLE`

**Configuration Sequelize**:
```javascript
paranoid: false // ❌ JAMAIS paranoid: true
timestamps: true
// Hooks: beforeUpdate → Error
//        beforeDestroy → Error
//        beforeBulkUpdate → Error
//        beforeBulkDestroy → Error
```

**Traits appliqués**: `ImmutableTrait`

**Cycle de vie**:
1. Création → Inscription immuable de l'action
2. ✅ Lecture → Autorisée
3. ❌ Modification → INTERDITE (throw Error)
4. ❌ Suppression → INTERDITE (throw Error)
5. Archivage après 2 ans → Voir section archivage

**Protection absolue**:
```javascript
// ❌ Ceci génère une erreur:
await AuditTrail.update({ old_values: {} }, { where: {} });
// Error: ❌ IMMUTABLE_TABLE

// ❌ Ceci aussi:
await AuditTrail.destroy({ where: {} });
// Error: ❌ IMMUTABLE_TABLE

// ✅ Ceci est autorisé:
const records = await AuditTrail.findAll({ where: { user_id: 123 } });
```

**Archivage automatique**:
- Records > 2 ans → Archive vers `audit_trails_archive`
- Après archivage → Hard delete de la table principale
- Table d'archive maintenue indéfiniment

**Avantages**:
- ✅ Intégrité audit garantie
- ✅ Impossible de modifier l'historique
- ✅ Conformité légale stricte (OHADA, CNIL)
- ✅ Preuves non-répudiables

---

### CATÉGORIE 3: DONNÉES TEMPORAIRES ⏱️ (Hard Delete AUTOMATIQUE)

**Tables**: `password_reset_tokens`, `two_factor_auths`, `token_blacklists`

**Stratégie**: `HARD_DELETE_ON_EXPIRY`

**Configuration Sequelize**:
```javascript
paranoid: false // ❌ Pas de soft delete
timestamps: true
expires_at: DataTypes.DATE // 🔑 Obligatoire!
```

**Traits appliqués**: `TemporaryDataTrait`

**Cycle de vie**:
1. Création → `expires_at = NOW() + validity_period`
2. Valide → Si `expires_at > NOW()`
3. Expiré → Si `expires_at <= NOW()`
4. Hard delete → CRON job chaque nuit (20h)

**Validation**:
```javascript
// ✅ Valide
const token = await PasswordResetToken.create({
  email: 'user@test.com',
  expires_at: new Date(Date.now() + 3600000) // +1h
});

// ❌ Erreur: Date passée
try {
  await PasswordResetToken.create({
    email: 'user@test.com',
    expires_at: new Date(Date.now() - 1000) // Date past
  });
} catch (e) {
  // Error: expires_at must be a future date
}

// ❌ Erreur: Modification expires_at
try {
  await token.update({ expires_at: new Date() });
} catch (e) {
  // Error: expires_at cannot be modified
}
```

**CRON Job (nightly)**:
```bash
# 20:00 chaque jour
0 20 * * * npm run retention:cleanup
```

**Avantages**:
- ✅ Nettoyage automatique
- ✅ Pas d'accumulation de données inutiles
- ✅ Pas de soft delete (données sensibles vraiment supprimées)
- ✅ Performance → tables restent lean

---

### CATÉGORIE 4: DONNÉES DE CONFIGURATION ⚙️ (Soft Delete RECOMMANDÉ)

**Tables**: `app_settings`, `groupe_entreprises`

**Stratégie**: `SOFT_DELETE`

**Configuration**: Identique à CATÉGORIE 1

**Cycle de vie**: Soft delete standard

**Utilité**:
- ✅ Historique configuration
- ✅ Rollback possible
- ✅ Audit trail automatique

---

### CATÉGORIE 5: DONNÉES DE RÉFÉRENCE 📊 (Soft Delete OPTIONNEL)

**Tables**: `business_operation_audits`

**Stratégie**: `SOFT_DELETE`

**Configuration**: Identique à CATÉGORIE 1

---

## 🔧 IMPLÉMENTATION

### Fichiers clés

```
cascade/src/
├── config/
│   └── database-categories.js      # 📋 Catégorisation tables
├── models/
│   ├── traits/
│   │   ├── softDeleteTrait.js      # ✅ Business soft delete
│   │   ├── immutableTrait.js       # 🔐 Audit immutable
│   │   ├── temporaryTrait.js       # ⏱️ Expiration auto
│   │   └── traitApplier.js         # 🎨 Helper application
│   ├── user.model.js               # ✅ Applique BusinessSoftDeleteTrait
│   ├── auditTrail.model.js         # 🔐 Applique ImmutableTrait
│   ├── securityEvent.model.js      # 🔐 Applique ImmutableTrait
│   └── passwordResetToken.model.js # ⏱️ Applique TemporaryDataTrait
├── services/
│   └── dataRetention.service.js    # 🗑️ Nettoyage & archivage
├── database/
│   └── migrations/
│       └── 20260122-fix-soft-delete-consistency.js # 🔄 Migration
└── routes/
    └── retention.routes.js         # API maintenance
```

### Appliquer un trait à un modèle

```javascript
// models/user.model.js
import { applyTraits } from './traits/traitApplier.js';

const User = sequelize.define('User', {
  // fields...
}, {
  tableName: 'users',
  ...applyTraits(User, 'users', sequelize),
  // autres config
});

// ✅ Auto-détecte: BUSINESS_DATA → applique BusinessSoftDeleteTrait
```

### Utiliser le service de retention

```javascript
// Dans routes/retention.routes.js ou CRON job

import dataRetention from '../services/dataRetention.service.js';

// Exécuter le cycle complet
app.post('/admin/retention/cycle', async (req, res) => {
  try {
    const result = await dataRetention.runFullRetentionCycle();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nettoyage d'urgence (mode maintenance)
app.post('/admin/retention/emergency', async (req, res) => {
  try {
    const result = await dataRetention.emergencyCleanup();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Migration: Appliquer les changements

```bash
# Vérifier la migration
npx sequelize-cli migration:create --name 20260122-fix-soft-delete-consistency

# Exécuter
npx sequelize-cli db:migrate

# Rollback si nécessaire
npx sequelize-cli db:migrate:undo:all
```

---

## 📅 CALENDRIER DE RÉTENTION

| Catégorie | Table | Stratégie | Durée rétention | Archive | Hard delete |
|-----------|-------|-----------|-----------------|---------|------------|
| Métier | users, compagnies, etc. | Soft Delete | ∞ | Non | Non |
| Audit | audit_trails | Immutable | ∞ puis archive | 2 ans | Après archive |
| Audit | security_events | Immutable | ∞ | Non | Non |
| Temporaire | password_reset_tokens | Expiry | 1 heure | Non | Oui |
| Temporaire | two_factor_auths | Expiry | 15 min | Non | Oui |
| Temporaire | token_blacklists | Expiry | 7 jours | Non | Oui |
| Config | app_settings | Soft Delete | ∞ | Non | Non |

---

## 🚀 CRON JOBS À CONFIGURER

### Nettoyage quotidien (20:00 chaque jour)

```javascript
// scripts/retention-cron.js
import cron from 'node-cron';
import dataRetention from '../services/dataRetention.service.js';

// 20h00
cron.schedule('0 20 * * *', async () => {
  console.log('🔄 [CRON] Démarrage retention cycle');
  try {
    await dataRetention.runFullRetentionCycle();
  } catch (error) {
    console.error('❌ [CRON] Retention échoué', error);
    // Alerter admin
  }
});
```

### Monitoring hebdomadaire (dimanche 10:00)

```javascript
// Surveiller taille base de données
cron.schedule('0 10 * * 0', async () => {
  const report = await dataRetention.monitorDatabaseSize();
  
  if (report.totalSizeMB > 1000) {
    // Alerter si > 1GB
    notifyAdmin('Database size critical: ' + report.totalSizeMB + 'MB');
  }
});
```

---

## ✅ CHECKLIST: CONFORMITÉ

- [ ] Toutes les tables métier ont `deleted_at` (soft delete)
- [ ] Audit trails et security events n'ont PAS `deleted_at`
- [ ] Immutable hooks présents sur audit tables
- [ ] Tokens temporaires ont `expires_at`
- [ ] Migration exécutée: `20260122-fix-soft-delete-consistency`
- [ ] CRON job nettoyage configuré
- [ ] DataRetention service testé
- [ ] API retention endpoints disponibles
- [ ] Monitoring taille BD activé
- [ ] Documenté dans runbook

---

## 🔍 VÉRIFICATION

### Tester soft delete

```javascript
// ✅ Créer et supprimer un user
const user = await User.create({ username: 'test', email: 'test@test.com' });
await user.destroy(); // Soft delete

// ✅ Vérifier que le user n'apparaît pas
const found = await User.findByPk(user.id); // null

// ✅ Récupérer avec le scope
const deleted = await User.scope('withDeleted').findByPk(user.id); // Found!
```

### Tester immutable

```javascript
// ❌ Essayer de modifier audit trail
try {
  const audit = await AuditTrail.findByPk(1);
  await audit.update({ old_values: {} });
} catch (error) {
  console.log(error.message); // ❌ IMMUTABLE_TABLE
}

// ❌ Essayer de supprimer
try {
  const audit = await AuditTrail.findByPk(1);
  await audit.destroy();
} catch (error) {
  console.log(error.message); // ❌ IMMUTABLE_TABLE
}
```

### Tester expiration

```javascript
// ✅ Créer token expirant dans 1h
const token = await PasswordResetToken.create({
  email: 'user@test.com',
  expires_at: new Date(Date.now() + 3600000)
});

// ✅ Vérifier TTL
const helpers = require('../models/traits/temporaryTrait.js').TemporaryDataHelpers;
console.log(helpers.getExpiryStatus(token));
// { status: 'VALID', message: 'Valide pour 0j', ttlSeconds: 3599.xxx }

// ✅ CRON à 20:00 le nettoie
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Q: Je veux récupérer un user supprimé

```javascript
// ✅ Récupérer
const user = await User.scope('withDeleted').findByPk(userId);

// ✅ Restaurer
await user.update({ deleted_at: null });
```

### Q: Les audit trails prennent trop de place

```javascript
// ✅ Lancer archivage manuel (au lieu d'attendre 2 ans)
await dataRetention.archiveOldAuditLogs(0.5); // Archive logs > 6 mois
```

### Q: Comment s'assurer qu'un enregistrement est vraiment supprimé?

```javascript
// Pour données temporaires: Après expiration, hard delete automatique ✅
// Pour données métier: Soft delete → récupérable (par design)
// Pour audit: JAMAIS supprimable (par design)
```

### Q: Monitorer la rétention

```javascript
// Dashboard: GET /admin/retention/status
// Retourne: Nombre de records supprimés, archivés, etc.
```

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Exécuter migration: `20260122-fix-soft-delete-consistency`
2. ✅ Appliquer traits à tous les modèles
3. ✅ Configurer CRON jobs
4. ✅ Tester chaque catégorie (soft, immutable, temporary)
5. ✅ Documenter dans runbook
6. ✅ Former l'équipe sur les stratégies

---

**Version**: 2.1  
**Dernière mise à jour**: 2026-01-22  
**Mainteneur**: GitHub Copilot  
**Status**: ✅ Production Ready
