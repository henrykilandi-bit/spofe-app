# Table: `account_balances`

**Domaine**: 🇬🇧 Comptabilité OHADA | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Soldes périodiques des comptes (par période/mois). Données de synthèse pour bilans/états financiers.

## 📋 Structure
```sql
CREATE TABLE account_balances (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id        INT NOT NULL,
  chart_of_account_id INT NOT NULL,
  period_start_date   DATE NOT NULL,
  period_end_date     DATE NOT NULL,
  opening_balance     DECIMAL(15,2) DEFAULT 0,
  debit_total         DECIMAL(15,2) DEFAULT 0,
  credit_total        DECIMAL(15,2) DEFAULT 0,
  closing_balance     DECIMAL(15,2) DEFAULT 0,
  is_final            BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP NULL,
  
  CONSTRAINT fk_account_balances_compagnie 
    FOREIGN KEY (compagnie_id) REFERENCES compagnies(id),
  CONSTRAINT fk_account_balances_account 
    FOREIGN KEY (chart_of_account_id) REFERENCES charts_of_accounts(id),
  
  UNIQUE INDEX uq_balances_account_period (chart_of_account_id, period_start_date, deleted_at),
  INDEX idx_balances_compagnie (compagnie_id),
  INDEX idx_balances_period (period_start_date, period_end_date)
);

ALTER TABLE account_balances CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Équilibre: closing = opening + debit - credit
- ✅ Période: 1 mois généralement
- ✅ Final: Once marked, non-modifiable (is_final=true)
- ✅ Calcul: Automatique après journal_entry.POSTED

## 📊 Hooks

```javascript
AccountBalance.beforeUpdate(async (balance) => {
  if (balance.isFinal) {
    throw new Error('Cannot modify final balance');
  }
});

AccountBalance.afterCreate(async (balance) => {
  // Calculer closing_balance
  balance.closingBalance = balance.openingBalance + 
                           balance.debitTotal - 
                           balance.creditTotal;
  await balance.save();
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
