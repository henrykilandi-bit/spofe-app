# Table: `third_parties` (Tiers)

**Domaine**: 🇬🇧 Comptabilité OHADA | **Criticité**: 🔴 HAUTE

## 🎯 Rôle Métier
Référentiel des tiers (clients, fournisseurs, salariés). Données de gestion commerciale/administrative.

## 📋 Structure
```sql
CREATE TABLE third_parties (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id      INT NOT NULL,
  code              VARCHAR(20) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  party_type        ENUM('CLIENT','SUPPLIER','EMPLOYEE','OTHER') NOT NULL,
  tax_id            VARCHAR(50),
  email             VARCHAR(255),
  phone             VARCHAR(20),
  address           TEXT,
  city              VARCHAR(100),
  postal_code       VARCHAR(20),
  country           VARCHAR(2),
  is_active         BOOLEAN DEFAULT TRUE,
  credit_limit      DECIMAL(15,2),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMP NULL,
  
  CONSTRAINT fk_third_parties_compagnie 
    FOREIGN KEY (compagnie_id) REFERENCES compagnies(id),
  
  UNIQUE INDEX uq_third_parties_code_compagnie (code, compagnie_id, deleted_at),
  INDEX idx_third_parties_compagnie (compagnie_id),
  INDEX idx_third_parties_type (party_type)
);

ALTER TABLE third_parties CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Code unique par compagnie
- ✅ Type: CLIENT, SUPPLIER, EMPLOYEE, OTHER
- ✅ Tax ID: Validation si présent
- ✅ Credit limit: Pour clients (optionnel)

## 📊 Hooks

```javascript
ThirdParty.beforeCreate(async (party) => {
  party.code = party.code.toUpperCase();
  party.country = party.country?.toUpperCase();
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
