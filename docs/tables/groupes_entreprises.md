# Table: `groupes_entreprises`

**Domaine**: 🇫🇷 Organisationnel | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Racine de l'architecture multi-locataire. Groupe d'entreprises contenant plusieurs compagnies (filiales).

## 📋 Structure
```sql
CREATE TABLE groupes_entreprises (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  code          VARCHAR(50) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  country       VARCHAR(2) DEFAULT 'BJ',
  currency      VARCHAR(3) DEFAULT 'XOF',
  fiscal_year_end INT DEFAULT 31,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  INDEX idx_groupes_code (code),
  UNIQUE INDEX uq_groupes_code_deleted (code, deleted_at)
);

ALTER TABLE groupes_entreprises CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔗 Dépendances
```
← users(groupe_entreprise_id)
← compagnies(groupe_entreprise_id)
```

## 📏 Règles Métier
- ✅ Code unique par groupe
- ✅ Devise immuable après création
- ✅ Soft delete activé

## 📊 Hooks

```javascript
GroupeEntreprise.beforeCreate(async (groupe) => {
  groupe.code = groupe.code.toUpperCase();
  groupe.country = groupe.country.toUpperCase();
  logInfo(`GroupeEntreprise.beforeCreate: ${groupe.code}`);
});

GroupeEntreprise.afterCreate(async (groupe, options) => {
  await SecurityEvent.create({
    event_type: 'groupe_created',
    event_data: { code: groupe.code, name: groupe.name }
  });
});
```

## 🧪 Tests
- Create valid groupe
- Fail: duplicate code
- Soft delete
- Multi-compagnie relationships

---

**Status**: ⏳ Model à créer (Phase 2)  
**Last Updated**: 25 Janvier 2026
