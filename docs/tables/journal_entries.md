# Table: `journal_entries`

**Domaine**: 🇬🇧 Comptabilité OHADA | **Criticité**: 🔴 CRITIQUE

## 🎯 Rôle Métier
Écritures comptables du journal. Chaque écriture contient 2+ lignes (débit/crédit), avec statut workflow (DRAFT → POSTED).

## 📋 Structure
```sql
CREATE TABLE journal_entries (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id    INT NOT NULL,
  journal_code    VARCHAR(20) NOT NULL,
  entry_date      DATE NOT NULL,
  reference       VARCHAR(50),
  description     TEXT,
  status          ENUM('DRAFT','POSTED','ARCHIVED') DEFAULT 'DRAFT',
  total_debit     DECIMAL(15,2) DEFAULT 0,
  total_credit    DECIMAL(15,2) DEFAULT 0,
  is_balanced     BOOLEAN DEFAULT FALSE,
  created_by_id   INT,
  posted_by_id    INT,
  posted_at       TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  
  CONSTRAINT fk_journal_entries_compagnie 
    FOREIGN KEY (compagnie_id) REFERENCES compagnies(id),
  CONSTRAINT fk_journal_entries_created_by 
    FOREIGN KEY (created_by_id) REFERENCES users(id),
  CONSTRAINT fk_journal_entries_posted_by 
    FOREIGN KEY (posted_by_id) REFERENCES users(id),
  
  INDEX idx_journal_entries_compagnie_id (compagnie_id),
  INDEX idx_journal_entries_entry_date (entry_date),
  INDEX idx_journal_entries_status (status),
  INDEX idx_journal_entries_reference (reference)
);

ALTER TABLE journal_entries CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🔗 Dépendances
```
→ compagnies(id)
→ users(id) [created_by, posted_by]
← journal_entry_lines(journal_entry_id)
← audit_trails(journal_entry_id)
```

## 📏 Règles Métier
- ✅ Équilibre: total_debit MUST = total_credit pour POSTED
- ✅ Workflow: DRAFT → POSTED → ARCHIVED
- ✅ Posted: Immuable (UPDATE interdite après posted_at)
- ✅ Débit/Crédit: Enregistrés dans lines, pas ici

## 📊 Hooks

```javascript
JournalEntry.beforeCreate(async (entry) => {
  entry.reference = entry.reference?.toUpperCase();
  logInfo(`JournalEntry.beforeCreate: ${entry.id}`);
});

JournalEntry.beforeUpdate(async (entry) => {
  if (entry.changed('status') && entry.status === 'POSTED') {
    // Vérifier équilibre
    if (entry.totalDebit !== entry.totalCredit) {
      throw new Error('Entry must be balanced before posting');
    }
    entry.postedAt = new Date();
  }
  
  if (entry.postedAt && entry.changed()) {
    throw new Error('Cannot modify posted entry');
  }
});

JournalEntry.afterCreate(async (entry) => {
  await AuditTrail.create({
    entity_type: 'JournalEntry',
    entity_id: entry.id,
    action: 'created',
    user_id: entry.createdById
  });
});
```

---

**Status**: ✅ Existant | **Last Updated**: 25 Janvier 2026
