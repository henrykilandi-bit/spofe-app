# 📋 DOCUMENTATION OFFICIELLE - CONVENTION DE NOMMAGE SPOFE v2.2

## 🎯 FICHE DE SYNTHÈSE RAPIDE
**Version**: 2.2.0  
**Date d'effet**: Immédiate  
**Statut**: ✅ Approuvé et Applicable  
**Compatibilité**: 100% rétrocompatible avec v2.1  
**Audience**: Tous les membres de l'équipe SPOFE  

---

## 🔄 CHANGEMENT CLAVE v2.2 : LE PARADIGME PRAGMATIQUE

### Ancien Paradigme (v2.1)
> "Toutes les tables doivent commencer par compagnies_"

### Nouveau Paradigme (v2.2)
> "La convention doit décrire le système réel, pas un système idéalisé."

**Impact**: Fin des refactorisations coûteuses pour une pureté théorique.  
**Bénéfice**: Gain de temps estimé: 80 heures de développement

---

## 🧭 PRINCIPES FONDAMENTAUX (INVARIABLES)

### 🔒 Invariants Techniques (NON NÉGOCIABLES)
| Règle | Exemple | Statut |
|-------|---------|---------|
| snake_case partout en BD | `journal_entry_lines` | ✅ Obligatoire |
| Pas de camelCase en BD | `groupe_id` (✔) vs `groupeId` (✗) | ❌ Interdit |
| Clés étrangères explicites | `compagnie_id`, `user_id` | ✅ Obligatoire |
| Timestamps standards | `created_at`, `updated_at` | ✅ Obligatoire |
| Soft delete partout | `deleted_at` nullable | ✅ Obligatoire |
| FK documentées | Documentation JOIN obligatoire | ✅ Obligatoire |

---

## 🏗️ NOUVELLE CLASSIFICATION PAR DOMAINE

### 🧱 DOMAINE ORGANISATIONNEL
**Rôle**: Structure hiérarchique multi-compagnies

| Table | Règle de Nommage | Justification |
|-------|------------------|----------------|
| `groupes_entreprises` | Nom métier pluriel français | Racine hiérarchique |
| `compagnies` | Nom métier pluriel français | Entité métier principale |
| `app_settings` | Anglais technique standard | Configuration système |

🚨 **Attention**: Ces tables sont structurelles, pas spécifiques à une compagnie.

### 🔐 DOMAINE IDENTITÉ & SÉCURITÉ (IAM)
**Rôle**: Gestion des accès, authentification, autorisations

| Table | Règle | Justification |
|-------|-------|----------------|
| `users` | Anglais standard | Alignement normes bancaires |
| `roles` | Anglais standard | RBAC international |
| `two_factor_auths` | Anglais explicite | Sécurité bancaire |
| `password_reset_tokens` | Anglais descriptif | Standards IAM |
| `token_blacklists` | Anglais descriptif | Revocation JWT |

💡 **Note**: Ces tables utilisent l'anglais pour l'interopérabilité avec les systèmes de sécurité externes.

### 📊 DOMAINE COMPTABILITÉ OHADA
**Rôle**: Cœur métier - Conformité comptable OHADA

| Table | Règle | Colonnes FR | Justification |
|-------|-------|-------------|----------------|
| `charts_of_accounts` | Anglais technique | `numero_compte`, `libellé` | Standard international |
| `journal_entries` | Anglais métier | `description`, `reference` | Processus comptable |
| `journal_entry_lines` | Anglais descriptif | `montant_debit`, `montant_credit` | Atomicité débit/crédit |
| `account_balances` | Anglais financier | `solde_debit`, `solde_credit` | États financiers |

🎯 **Philosophie**: Anglais pour la structure, Français pour le contenu

### 📝 DOMAINE AUDIT & TRAÇABILITÉ
**Rôle**: Immutabilité, conformité, investigation

| Table | Règle | Criticité |
|-------|-------|------------|
| `audit_trails` | Anglais fonctionnel | ⭐⭐⭐⭐⭐ |
| `security_events` | Anglais sécurité | ⭐⭐⭐⭐ |

**Principe**: "Tout ce qui modifie l'état métier doit être auditable"

---

## 📝 CONVENTION DES COLONNES

### 4.1 Règles Générales
| Élément | Convention | Exemple Correct | Exemple Interdit |
|---------|------------|-----------------|------------------|
| Clé primaire | `id` | `id` | `userId`, `ID` |
| Clé étrangère | `{entite}_id` | `compagnie_id`, `user_id` | `compagnieId`, `compagny_id` |
| Booléen | `is_*`, `can_*`, `has_*` | `is_active`, `can_approve` | `active`, `approvable` |
| Enum | `status`, `type`, `role` | `status`, `user_type` | `state`, `userRole` |
| Date | `*_at`, *_date` | `created_at`, `entry_date` | `creationDate`, `createdAt` |
| Période | `YYYY-MM` | `periode = '2026-01'` | `month_year`, `period` |

### 4.2 Colonnes Spécifiques OHADA (FRANÇAIS)
| Concept OHADA | Nom Colonne | Type | Exemple |
|---------------|-------------|------|---------|
| Numéro compte | `numero_compte` | VARCHAR(20) | `'512345'` |
| Libellé compte | `libellé` | VARCHAR(255) | `'Banque BICIS'` |
| Type compte | `type_compte` | ENUM | `'ACTIF'`, `'PASSIF'` |
| Montant débit | `montant_debit` | DECIMAL(15,2) | `150000.00` |
| Montant crédit | `montant_credit` | DECIMAL(15,2) | `150000.00` |

### 4.3 Colonnes INTERDITES (Sanctionnées)
```sql
-- ❌ INTERDIT - À SUPPRIMER IMMÉDIATEMENT
groupeId
invitationToken
userRole
creationDate

-- ✅ CORRECT - À UTILISER
groupe_id
invitation_token
role
created_at
```

---

## 🔧 CONVENTION ORM SEQUELIZE

### Configuration Obligatoire
```javascript
const User = sequelize.define('User', {
  // Attributs avec types explicites
}, {
  tableName: 'users',              // Nom table en snake_case
  underscored: true,               // Conversion auto camelCase→snake_case
  timestamps: true,                // created_at, updated_at automatiques
  paranoid: true,                  // Soft delete avec deleted_at
  
  // Hooks obligatoires
  hooks: {
    beforeCreate: normalizeBusinessLogic,
    beforeUpdate: auditTrailHook,
    afterCreate: securityLogHook
  }
});
```

### Hooks Obligatoires
- **beforeCreate**: Normalisation métier OHADA
- **beforeUpdate**: Enregistrement dans audit_trails
- **afterCreate**: Journalisation sécurité

---

## 🎨 CONVENTION FRONTEND ↔ BACKEND

### Mapping DTO (Data Transfer Object)
```javascript
// Frontend (camelCase)
const userData = {
  email: 'user@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  companyId: 1,
  role: 'comptable'
};

// Backend API (snake_case via Joi)
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  first_name: Joi.string().min(2).required(),
  last_name: Joi.string().min(2).required(),
  company_id: Joi.number().integer().required(),
  role: Joi.string().valid('admin', 'comptable', 'consultant')
});

// Service (conversion auto grâce à underscored: true)
const user = await User.create(userData); // Conversion automatique
```

### Règles de Mapping
- **Frontend**: Toujours camelCase
- **Backend API**: Accepte camelCase, convertit en snake_case
- **Base de données**: Uniquement snake_case
- **Validation**: Joi en snake_case

---

## 📋 CONVENTION DOCUMENTAIRE (NOUVEAU v2.2)

### Template Obligatoire par Table
```markdown
## 📊 TABLE: journal_entries

### 🎯 Rôle Métier
Écritures comptables OHADA - Enregistrement des opérations financières

### ⚠️ Criticité
TRÈS ÉLEVÉE (Cœur du système comptable)

### 🏢 Multi-Tenant
✅ OUI - Filtrage obligatoire par `compagnie_id` 

### 🔐 Auditée
✅ OUI - Toutes les modifications tracées dans `audit_trails` 

### 🗑️ Soft Delete
✅ OUI - Via `deleted_at` 

### 📝 Colonnes Clés
| Colonne | Type | Description | OHADA |
|---------|------|-------------|-------|
| `compagnie_id` | INT | FK vers compagnies | ❌ |
| `numero_journal` | VARCHAR(20) | Code journal (VT, BQ) | ✅ |
| `description` | TEXT | Libellé opération | ✅ |
| `entry_date` | DATE | Date écriture | ✅ |
| `status` | ENUM | draft/submitted/approved | ✅ |

### 🔗 Dépendances
- `journal_entry_lines` (1:N)
- `compagnies` (N:1)
- `users` (created_by, posted_by)

### 🚨 Règles Métier
1. Débit total = Crédit total
2. Minimum 2 lignes par écriture
3. Seulement `posted` affecte les soldes
```

### Fichiers de Documentation
```
/docs/tables/
├── journal_entries.md
├── users.md
├── charts_of_accounts.md
└── audit_trails.md
```

---

## 🔍 GOUVERNANCE & CONTRÔLE

### Audit Automatique
```bash
# Vérification quotidienne
npm run conventions:check

# Vérification pré-commit (bloquante)
npm run conventions:precommit

# Rapport détaillé
npm run conventions:report
```

### Pipeline CI/CD
```yaml
# .github/workflows/conventions.yml
steps:
  - name: Check naming conventions
    run: npm run conventions:check
    # ❌ Échec si violation détectée
  
  - name: Generate compliance report
    run: npm run conventions:report
```

### Nouvelle Table - Checklist
- [ ] Déclarer le domaine fonctionnel
- [ ] Justifier la langue (FR/EN)
- [ ] Documenter selon template
- [ ] Ajouter hooks Sequelize
- [ ] Tester conventions-checker
- [ ] Valider avec équipe métier

---

## 📚 GLOSSAIRE FRANÇAIS ↔ ANGLAIS

### Comptabilité OHADA
| Français | Anglais (Table) | Justification |
|----------|----------------|---------------|
| Plan Comptable | `charts_of_accounts` | Standard international |
| Écriture Comptable | `journal_entry` | Processus métier |
| Ligne d'Écriture | `journal_entry_line` | Atomicité technique |
| Grand Livre | `general_ledger` | Terme financier standard |

### Sécurité
| Français | Anglais (Table) | Justification |
|----------|----------------|---------------|
| Authentification 2FA | `two_factor_auths` | Norme sécurité bancaire |
| Jetons de Réinitialisation | `password_reset_tokens` | Standard OWASP |
| Liste Noire de Jetons | `token_blacklists` | Revocation JWT |
| Événements de Sécurité | `security_events` | Monitoring SIEM |

### Organisation
| Français | Anglais (Table) | Justification |
|----------|----------------|---------------|
| Paramètres Application | `app_settings` | Configuration technique |
| Piste d'Audit | `audit_trails` | Conformité légale |

---

## 🚀 PLAN DE TRANSITION v2.1 → v2.2

### Phase 1 : Documentation (Semaine 1)
```bash
# J1-2 : Mise à jour documentation
1. Mettre à jour CONVENTIONS_NOMMAGE_SPOFE_v2.2.md
2. Créer documentation des 14 tables existantes
3. Mettre à jour les commentaires des modèles Sequelize

# J3-4 : Formation équipe
4. Session formation (2h) - Nouvelle philosophie
5. Q&A avec l'équipe technique
6. Q&A avec l'équipe métier

# J5 : Validation
7. Revue complète avec stakeholders
8. Approbation officielle v2.2
```

### Phase 2 : Nettoyage (Semaine 2)
```sql
-- Script de migration unique
-- Suppression des colonnes camelCase
ALTER TABLE users 
DROP COLUMN IF EXISTS groupeId,
DROP COLUMN IF EXISTS invitationToken;

-- Mise à jour des indexes
-- Vérification des contraintes
```

### Phase 3 : Monitoring (Continue)
- Audit automatique hebdomadaire
- Revue mensuelle des conventions
- Mise à jour trimestrielle du glossaire

---

## 📊 TABLEAU DE CONFORMITÉ v2.2

| Table | Domaine | Langue | Conformité | Actions |
|-------|---------|--------|-------------|---------|
| `groupes_entreprises` | Organisationnel | 🇫🇷 | ✅ | Aucune |
| `compagnies` | Organisationnel | 🇫🇷 | ✅ | Aucune |
| `users` | Identité & Sécurité | 🇬🇧 | ✅ | Nettoyer camelCase |
| `roles` | Identité & Sécurité | 🇬🇧 | ✅ | Aucune |
| `charts_of_accounts` | Comptabilité | 🇬🇧 | ✅ | Documenter FR |
| `journal_entries` | Comptabilité | 🇬🇧 | ✅ | Documenter FR |
| `journal_entry_lines` | Comptabilité | 🇬🇧 | ✅ | Documenter FR |
| `account_balances` | Comptabilité | 🇬🇧 | ✅ | Documenter FR |
| `two_factor_auths` | Identité & Sécurité | 🇬🇧 | ✅ | Aucune |
| `password_reset_tokens` | Identité & Sécurité | 🇬🇧 | ✅ | Aucune |
| `token_blacklists` | Identité & Sécurité | 🇬🇧 | ✅ | Aucune |
| `security_events` | Audit | 🇬🇧 | ✅ | Aucune |
| `audit_trails` | Audit | 🇬🇧 | ✅ | Aucune |
| `app_settings` | Organisationnel | 🇬🇧 | ✅ | Aucune |

**Résultat**: 14/14 tables conformes à v2.2

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Ce que v2.2 Apporte
- ✅ Cohérence sans dogmatisme
- ✅ Respect du système existant
- ✅ Zéro migration destructrice
- ✅ Lisibilité métier + technique
- ✅ Convention enfin applicable

### Messages Clés à l'Équipe
1. **Stop aux refactorisations inutiles pour pureté théorique**
2. **Priorité au métier OHADA dans les colonnes**
3. **Anglais accepté pour l'interopérabilité technique**
4. **Documentation obligatoire pour chaque table**
5. **Audit automatique pour maintenir la qualité**

### Philosophie SPOFE v2.2
> "La convention sert le métier, le métier ne sert pas la convention."

---

## 📞 SUPPORT ET QUESTIONS

**Pour toute question sur les conventions:**
- 📧 Email: `tech@spofe.sn`
- 📱 Slack: `#conventions-spofe`
- 📚 Documentation: `/docs/conventions/`

**En cas de doute:**
1. Vérifier ce document
2. Consulter le glossaire
3. Demander validation à l'équipe
4. Toujours privilégier la clarté métier

---

*Document maintenu par l'équipe technique SPOFE - Version 2.2.0*
