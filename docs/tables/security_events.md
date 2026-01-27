# Table: `security_events`

**Domaine**: 🇬🇧 Audit & Traçabilité | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Événements sécurité (logins, accès non autorisés, changes sensibles). Immuable pour audit.

## 📋 Structure
```sql
CREATE TABLE security_events (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT,
  event_type      VARCHAR(100) NOT NULL,
  event_data      JSON,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  
  CONSTRAINT fk_security_events_user 
    FOREIGN KEY (user_id) REFERENCES users(id),
  
  INDEX idx_security_events_user (user_id),
  INDEX idx_security_events_event_type (event_type),
  INDEX idx_security_events_created_at (created_at)
);

ALTER TABLE security_events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Immuable: Soft delete seulement (JAMAIS UPDATE)
- ✅ Event types: login, logout, failed_auth, user_created, etc.
- ✅ IP + User-Agent: Toujours enregistrés
- ✅ Retention: 12+ mois (pour audit)

## 📊 Hooks

```javascript
SecurityEvent.beforeUpdate(() => {
  throw new Error('Security events are immutable');
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
