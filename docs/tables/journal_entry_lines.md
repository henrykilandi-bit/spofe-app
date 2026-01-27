# Table: `journal_entry_lines`

**Domaine**: 🇬🇧 Comptabilité OHADA | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Lignes d'une écriture comptable. Chaque ligne = débit OU crédit sur un compte. Atomiques (2+ lignes par écriture).

## 📋 Structure
```sql
CREATE TABLE journal_entry_lines (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  journal_entry_id    INT NOT NULL,
  chart_of_account_id INT NOT NULL,
  debit_amount        DECIMAL(15,2) DEFAULT 0,
  credit_amount       DECIMAL(15,2) DEFAULT 0,
  description         TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMP NULL,
  
  CONSTRAINT fk_journal_entry_lines_journal 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  CONSTRAINT fk_journal_entry_lines_account 
    FOREIGN KEY (chart_of_account_id) REFERENCES charts_of_accounts(id),
  
  INDEX idx_journal_entry_lines_journal (journal_entry_id),
  INDEX idx_journal_entry_lines_account (chart_of_account_id)
);

ALTER TABLE journal_entry_lines CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📏 Règles Métier
- ✅ Atomicité: Soit débit, soit crédit (jamais les deux)
- ✅ Min 2 lignes par écriture (après création)
- ✅ Immuable après journal_entry.POSTED
- ✅ Cascade DELETE sur écriture

## 📊 Hooks

```javascript
JournalEntryLine.beforeCreate(async (line) => {
  // Vérifier soit débit, soit crédit
  if ((line.debitAmount > 0 && line.creditAmount > 0) ||
      (line.debitAmount === 0 && line.creditAmount === 0)) {
    throw new Error('Line must have either debit OR credit, not both or neither');
  }
});

JournalEntryLine.beforeUpdate(async (line) => {
  const journal = await JournalEntry.findByPk(line.journalEntryId);
  if (journal.status === 'POSTED') {
    throw new Error('Cannot modify lines of posted entry');
  }
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
