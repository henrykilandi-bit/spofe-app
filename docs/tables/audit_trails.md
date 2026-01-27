# Table: `audit_trails`

**Domaine**: 🇬🇧 Audit & Traçabilité | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Immuable audit trail de TOUS les changes (CREATE, UPDATE, DELETE) sur entités critiques. Traçabilité légale/conformité.

## 📋 Structure
```sql
CREATE TABLE audit_trails (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  user_id           INT,
  entity_type       VARCHAR(100) NOT NULL,
  entity_id         INT NOT NULL,
  action            ENUM('CREATE','UPDATE','DELETE') NOT NULL,
  old_values        JSON,
  new_values        JSON,
  change_summary    TEXT,
  ip_address        VARCHAR(45),
  user_agent        VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP NULL,
  
  CONSTRAINT fk_audit_trails_user 
    FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_audit_trails_entity (entity_type, entity_id),
  INDEX idx_audit_trails_user (user_id),
  INDEX idx_audit_trails_action (action),
  INDEX idx_audit_trails_created_at (created_at)
);

ALTER TABLE audit_trails CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Immuable: Soft delete seulement (JAMAIS UPDATE)
- ✅ Enregistrer: JournalEntry, User, Compagnie, ChartOfAccount changes
- ✅ Old/New values: Full JSON diff
- ✅ Retention: 7+ ans (pour conformité)

## 📊 Hooks

```javascript
AuditTrail.beforeUpdate(() => {
  throw new Error('Audit trails are immutable');
});

// Ajouter dans tous les modèles (afterCreate, afterUpdate, beforeDestroy):
User.afterCreate(async (user, options) => {
  await AuditTrail.create({
    user_id: options.userId,
    entity_type: 'User',
    entity_id: user.id,
    action: 'CREATE',
    new_values: user.toJSON(),
    ip_address: options.ipAddress,
    user_agent: options.userAgent
  });
});

User.afterUpdate(async (user, options) => {
  const changes = user.changed();
  if (changes && changes.length > 0) {
    await AuditTrail.create({
      user_id: options.userId,
      entity_type: 'User',
      entity_id: user.id,
      action: 'UPDATE',
      old_values: user._previousDataValues,
      new_values: user.toJSON(),
      change_summary: changes.join(', '),
      ip_address: options.ipAddress,
      user_agent: options.userAgent
    });
  }
});
```

---

**Status**: ⏳ Model à créer (Phase 2) | **Last Updated**: 25 Janvier 2026
