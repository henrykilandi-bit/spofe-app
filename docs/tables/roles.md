# Table: `roles`

## 🎯 Rôle Métier
Référentiel des rôles utilisateur (ADMIN, USER, VIEWER, etc.) avec permissions associées. Système d'autorisation basé sur les rôles (RBAC - Role-Based Access Control).

**Domaine**: 🇬🇧 Identité & Sécurité

## 🔴 Criticité
**HAUTE** - Contrôle d'accès critique
- Impact: Accès non autorisé ou refus d'accès légitime
- Récupérabilité: HAUTE (soft delete)

## 📋 Structure

```sql
CREATE TABLE roles (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  name              VARCHAR(50) UNIQUE NOT NULL,   -- ADMIN, USER, VIEWER, etc.
  description       TEXT,                         -- Description du rôle
  permissions       JSON,                         -- Liste permissions (array)
  is_system_role    BOOLEAN DEFAULT FALSE,        -- Rôles système non modifiables
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP NULL,
  
  INDEX idx_roles_name (name),
  INDEX idx_roles_is_active (is_active)
);

ALTER TABLE roles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔗 Dépendances
```
→ Aucune FK sortante (référence indépendante)

← users(role_id)                [FK] Utilisateurs avec ce rôle
← role_approval_workflows(role_id) [FK] Workflows associés
```

## 📏 Règles Métier
- ✅ Permissions: Array JSON de codes (create_entry, approve_entry, view_reports, etc.)
- ✅ Rôles systèmes: ADMIN, USER, VIEWER (non supprimables)
- ✅ Unicité nom: Globale
- ✅ Immutable après création: Soft delete seulement

## 🔐 Sécurité
- ✅ Audit: Tous les changes enregistrés
- ✅ Validations: Permissions valides uniquement

## 📊 Audit & Traçabilité

```javascript
// cascade/src/models/role.model.js

Role.beforeCreate(async (role) => {
  // Valider permissions
  const validPermissions = [
    'create_entry', 'edit_entry', 'delete_entry', 'approve_entry',
    'view_entries', 'view_reports', 'manage_users', 'manage_roles'
  ];
  
  if (role.permissions) {
    const invalid = role.permissions.filter(p => !validPermissions.includes(p));
    if (invalid.length > 0) {
      throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
    }
  }
  
  logInfo(`Role.beforeCreate: ${role.name}`);
});

Role.afterCreate(async (role, options) => {
  await SecurityEvent.create({
    event_type: 'role_created',
    event_data: { name: role.name, permissions: role.permissions }
  });
});
```

## 📝 Statut Implémentation
- ✅ Table créée et fonctionnelle
- ✅ Model Sequelize complet
- ✅ Soft delete activé
- ⏳ Hooks: À compléter (Phase 3)
- ⏳ Documentation: 🆕 Complete!

---

**Domaine**: 🇬🇧 Identité & Sécurité  
**Criticité**: 🔴 HAUTE  
**Status**: ✅ Aligné v2.2  
**Last Updated**: 25 Janvier 2026
