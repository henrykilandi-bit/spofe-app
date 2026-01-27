# Table: `charts_of_accounts`

**Domaine**: 🇬🇧 Comptabilité OHADA | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Plan comptable OHADA (structure hiérarchique des comptes). Arborescence: Classe → Groupe → Compte.

## 📋 Structure
```sql
CREATE TABLE charts_of_accounts (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id      INT NOT NULL,
  account_number    VARCHAR(20) NOT NULL,
  account_name      VARCHAR(255) NOT NULL,
  account_type      ENUM('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
  parent_id         INT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP NULL,
  
  CONSTRAINT fk_charts_compagnie 
    FOREIGN KEY (compagnie_id) REFERENCES compagnies(id),
  CONSTRAINT fk_charts_parent 
    FOREIGN KEY (parent_id) REFERENCES charts_of_accounts(id),
  
  UNIQUE INDEX uq_charts_number_compagnie (account_number, compagnie_id, deleted_at),
  INDEX idx_charts_compagnie (compagnie_id),
  INDEX idx_charts_type (account_type),
  INDEX idx_charts_parent (parent_id)
);

ALTER TABLE charts_of_accounts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Numéro compte: Unique par compagnie (OHADA: 1-9 classes)
- ✅ Hiérarchique: Parent-enfant (auto-FK)
- ✅ Immuable après création: Soft delete seulement
- ✅ OHADA standard: 9 classes obligatoires

## 📊 Hooks

```javascript
ChartOfAccount.beforeCreate(async (account) => {
  // Valider format compte OHADA
  if (!/^[1-9](\d{1,4})?$/.test(account.accountNumber)) {
    throw new Error('Invalid OHADA account number');
  }
  logInfo(`ChartOfAccount.beforeCreate: ${account.accountNumber}`);
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
