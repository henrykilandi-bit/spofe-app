# 🔧 PHASE 3: HOOKS IMPLEMENTATION - GUIDE DÉTAILLÉ

**Date**: 25 Janvier 2026 (Start Phase 3)  
**Statut**: 🟢 READY TO EXECUTE  
**Duration**: 16 heures (split 2 parts: 8h each)  
**Target Score**: 85/100 → 92/100 (+7 points)

---

## 📋 PHASE 3 C'EST QUOI?

Implémenter les **hooks Sequelize** dans tous les modèles pour:

```
✅ beforeCreate: Normalisation métier + validation
✅ beforeUpdate: Audit trail logging + immutability checks
✅ afterCreate: SecurityEvent logging (audit trail)
✅ beforeDestroy: Soft delete safeguards (paranoid mode)
```

**Non-destructif**: Tous les hooks ajoutés aux modèles existants sans breaking changes.

---

## 🎯 HOOKS PAR MODÈLE (10 modèles, 40+ hooks total)

### PRIORITÉ 1: 6 Modèles CRITIQUES (Phase 3a: 8h)

#### 1️⃣ **User.model.js** (6 hooks)

```javascript
// BEFORE HOOKS
beforeCreate: [
  async (user) => {
    // 1. Hash password (bcrypt 10 rounds)
    const bcrypt = require('bcryptjs');
    user.password = await bcrypt.hash(user.password, 10);
    
    // 2. Normalize email (lowercase + trim)
    user.email = user.email.toLowerCase().trim();
    user.username = user.username?.trim();
    
    // 3. Validate role exists
    if (user.roleId) {
      const role = await sequelize.models.Role.findByPk(user.roleId);
      if (!role) throw new Error('Invalid roleId');
    }
  }
]

beforeUpdate: [
  async (user, options) => {
    // 1. Hash password only if changed
    if (user.changed('password')) {
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(user.password, 10);
    }
    
    // 2. Create audit trail
    if (user.changed()) {
      await AuditTrail.create({
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        action: 'UPDATE',
        oldValues: user._previousDataValues,
        newValues: user.dataValues,
        changeSummary: `Updated: ${user.changed().join(', ')}`
      });
    }
  }
]

afterCreate: [
  async (user) => {
    // Log security event
    await SecurityEvent.create({
      userId: user.id,
      eventType: 'user_created',
      description: `User created: ${user.email}`,
      severity: 'INFO'
    });
  }
]

beforeDestroy: [
  async (user) => {
    // Soft delete safeguard (paranoid mode active)
    // Prevent if user has active journal entries
    const activeEntries = await JournalEntry.count({
      where: { createdById: user.id, status: 'POSTED' }
    });
    if (activeEntries > 0) {
      throw new Error('Cannot delete user with active journal entries');
    }
  }
]
```

**Validations Métier**:
- ✅ Password hashing AVANT insert
- ✅ Email normalization (lowercase)
- ✅ FK roleId validation
- ✅ Audit trail AFTER update
- ✅ SecurityEvent AFTER create
- ✅ Soft delete safeguard BEFORE destroy

---

#### 2️⃣ **Compagnie.model.js** (5 hooks)

```javascript
beforeCreate: [
  async (compagnie) => {
    // 1. Normalize code (uppercase)
    compagnie.code = compagnie.code?.toUpperCase();
    
    // 2. Validate group exists
    const groupe = await GroupeEntreprise.findByPk(compagnie.groupeEntrepriseId);
    if (!groupe) throw new Error('Invalid groupeEntrepriseId');
    
    // 3. Currency validation
    const validCurrencies = ['XOF', 'EUR', 'USD', 'GBP'];
    if (!validCurrencies.includes(compagnie.currency)) {
      throw new Error('Invalid currency code');
    }
  }
]

beforeUpdate: [
  async (compagnie) => {
    // 1. Immutability check: currency cannot change
    if (compagnie.changed('currency')) {
      throw new Error('Currency cannot be changed after creation');
    }
    
    // 2. Audit trail
    if (compagnie.changed()) {
      await AuditTrail.create({
        entityType: 'Compagnie',
        entityId: compagnie.id,
        action: 'UPDATE',
        oldValues: compagnie._previousDataValues,
        newValues: compagnie.dataValues,
        changeSummary: `Updated: ${compagnie.changed().join(', ')}`
      });
    }
  }
]

afterCreate: [
  async (compagnie) => {
    await SecurityEvent.create({
      eventType: 'compagnie_created',
      description: `Company created: ${compagnie.name}`,
      severity: 'INFO'
    });
  }
]
```

---

#### 3️⃣ **JournalEntry.model.js** (7 hooks)

```javascript
beforeCreate: [
  async (entry) => {
    // 1. Validate compagnie exists
    const compagnie = await Compagnie.findByPk(entry.compagnieId);
    if (!compagnie) throw new Error('Invalid compagnieId');
    
    // 2. Set default status DRAFT
    entry.status = 'DRAFT';
    
    // 3. Validate creator exists
    if (entry.createdById) {
      const user = await User.findByPk(entry.createdById);
      if (!user) throw new Error('Invalid createdById');
    }
  }
]

beforeUpdate: [
  async (entry) => {
    // 1. DRAFT → POSTED validation
    if (entry.changed('status') && entry.status === 'POSTED') {
      const lines = await JournalEntryLine.findAll({
        where: { journalEntryId: entry.id }
      });
      
      if (lines.length < 2) throw new Error('At least 2 lines required');
      
      let totalDebit = 0, totalCredit = 0;
      lines.forEach(line => {
        if (line.debitAmount) totalDebit += line.debitAmount;
        if (line.creditAmount) totalCredit += line.creditAmount;
      });
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Entry must be balanced (debit = credit)');
      }
    }
    
    // 2. Cannot modify POSTED entries
    if (entry._previousDataValues.status === 'POSTED' && entry.changed()) {
      throw new Error('Cannot modify POSTED entries');
    }
    
    // 3. Audit trail
    if (entry.changed()) {
      await AuditTrail.create({
        userId: entry.createdById,
        entityType: 'JournalEntry',
        entityId: entry.id,
        action: 'UPDATE',
        oldValues: entry._previousDataValues,
        newValues: entry.dataValues,
        changeSummary: `Status changed: ${entry._previousDataValues.status} → ${entry.status}`
      });
    }
  }
]

afterCreate: [
  async (entry) => {
    await SecurityEvent.create({
      userId: entry.createdById,
      eventType: 'journal_entry_created',
      description: `Journal entry #${entry.id} created`,
      severity: 'INFO'
    });
  }
]
```

---

#### 4️⃣ **ChartOfAccount.model.js** (4 hooks)

```javascript
beforeCreate: [
  async (account) => {
    // 1. Validate account number format (OHADA: 1-8 digits)
    if (!/^\d{1,8}$/.test(account.accountNumber)) {
      throw new Error('Invalid account number format (OHADA: 1-8 digits)');
    }
    
    // 2. Validate account type
    const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
    if (!validTypes.includes(account.accountType)) {
      throw new Error('Invalid account type');
    }
    
    // 3. Check uniqueness per company
    const existing = await ChartOfAccount.findOne({
      where: {
        compagnieId: account.compagnieId,
        accountNumber: account.accountNumber
      }
    });
    if (existing) throw new Error('Account number already exists in this company');
  }
]

beforeUpdate: [
  async (account) => {
    // 1. Account number immutable
    if (account.changed('accountNumber')) {
      throw new Error('Account number cannot be changed');
    }
    
    // 2. Account type immutable (impacts history)
    if (account.changed('accountType')) {
      throw new Error('Account type cannot be changed');
    }
    
    // 3. Audit trail
    if (account.changed()) {
      await AuditTrail.create({
        entityType: 'ChartOfAccount',
        entityId: account.id,
        action: 'UPDATE',
        oldValues: account._previousDataValues,
        newValues: account.dataValues,
        changeSummary: `Updated: ${account.changed().join(', ')}`
      });
    }
  }
]
```

---

#### 5️⃣ **JournalEntryLine.model.js** (4 hooks)

```javascript
beforeCreate: [
  async (line) => {
    // 1. XOR: Either debit OR credit, never both
    const hasDebit = line.debitAmount && line.debitAmount > 0;
    const hasCredit = line.creditAmount && line.creditAmount > 0;
    
    if (hasDebit && hasCredit) {
      throw new Error('Line cannot have both debit and credit amounts');
    }
    
    if (!hasDebit && !hasCredit) {
      throw new Error('Line must have either debit or credit amount');
    }
    
    // 2. Validate chart of account exists
    const coa = await ChartOfAccount.findByPk(line.chartOfAccountId);
    if (!coa) throw new Error('Invalid chartOfAccountId');
    
    // 3. Validate journal entry exists and is DRAFT
    const entry = await JournalEntry.findByPk(line.journalEntryId);
    if (!entry) throw new Error('Invalid journalEntryId');
    if (entry.status !== 'DRAFT') {
      throw new Error('Can only add lines to DRAFT entries');
    }
  }
]

beforeUpdate: [
  async (line) => {
    // 1. Cannot modify line in POSTED entry
    const entry = await JournalEntry.findByPk(line.journalEntryId);
    if (entry.status === 'POSTED') {
      throw new Error('Cannot modify lines in POSTED entries');
    }
    
    // 2. XOR validation on update
    const hasDebit = line.debitAmount && line.debitAmount > 0;
    const hasCredit = line.creditAmount && line.creditAmount > 0;
    
    if (hasDebit && hasCredit) {
      throw new Error('Line cannot have both debit and credit amounts');
    }
  }
]
```

---

#### 6️⃣ **ThirdParty.model.js** (4 hooks)

```javascript
beforeCreate: [
  async (tp) => {
    // 1. Validate type
    const validTypes = ['CLIENT', 'SUPPLIER', 'EMPLOYEE', 'OTHER'];
    if (!validTypes.includes(tp.type)) {
      throw new Error('Invalid third party type');
    }
    
    // 2. Credit limit validation (must be >= 0)
    if (tp.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative');
    }
    
    // 3. Normalize phone (remove spaces, special chars)
    if (tp.phone) {
      tp.phone = tp.phone.replace(/\D/g, '');
    }
  }
]

beforeUpdate: [
  async (tp) => {
    // 1. Audit trail
    if (tp.changed()) {
      await AuditTrail.create({
        entityType: 'ThirdParty',
        entityId: tp.id,
        action: 'UPDATE',
        oldValues: tp._previousDataValues,
        newValues: tp.dataValues,
        changeSummary: `Updated: ${tp.changed().join(', ')}`
      });
    }
  }
]
```

---

### PRIORITÉ 2: 4 Modèles SUPPLÉMENTAIRES (Phase 3b: 8h)

#### 7️⃣ **AccountBalance.model.js**
```
beforeCreate: Validate compagnie + chart of account
beforeUpdate: Immutability check on isFinal=true
```

#### 8️⃣ **AppSetting.model.js** / **AppSettings.model.js**
```
beforeCreate: Validate system setting immutability
beforeUpdate: Prevent system setting changes
```

#### 9️⃣ **Role.model.js**
```
beforeCreate: Validate role name uniqueness
beforeUpdate: Prevent system role modifications
```

#### 🔟 **SecurityEvent.model.js**
```
beforeUpdate: Throw error (immutable audit log)
beforeDestroy: Log deletion attempt
```

---

## ⏱️ TIMELINE PHASE 3

### **PHASE 3a: 8 heures (6 modèles prioritaires)**

```
JOUR 1 (Lundi):
  ☐ 09:00-11:00: User hooks (beforeCreate, beforeUpdate, afterCreate, beforeDestroy)
  ☐ 11:00-12:00: Tests User hooks (50+ cas)
  ☐ 12:00-13:00: LUNCH
  ☐ 13:00-14:30: Compagnie hooks (beforeCreate, beforeUpdate, afterCreate)
  ☐ 14:30-15:30: Tests Compagnie hooks (40+ cas)

JOUR 2 (Mardi):
  ☐ 09:00-11:00: JournalEntry hooks (complexe: 7 hooks)
  ☐ 11:00-12:00: Tests JournalEntry (status workflow, balance validation)
  ☐ 12:00-13:00: LUNCH
  ☐ 13:00-14:30: ChartOfAccount hooks (OHADA validation, immutability)
  ☐ 14:30-15:30: Tests ChartOfAccount (50+ cas)

JOUR 3 (Mercredi):
  ☐ 09:00-10:00: JournalEntryLine hooks (XOR validation)
  ☐ 10:00-11:00: Tests JournalEntryLine (atomicity tests)
  ☐ 11:00-12:00: ThirdParty hooks (type + credit limit validation)
  ☐ 12:00-13:00: Tests ThirdParty (40+ cas)
  ☐ 13:00-15:00: Integration tests (all 6 models together)

TOTAL PHASE 3a: 8 heures ✅
```

### **PHASE 3b: 8 heures (4 modèles supplémentaires)**

```
JOUR 4 (Jeudi):
  ☐ 09:00-10:00: AccountBalance hooks
  ☐ 10:00-11:00: AppSetting/AppSettings hooks
  ☐ 11:00-12:00: Role hooks (immutability system roles)
  ☐ 12:00-13:00: LUNCH
  ☐ 13:00-15:00: SecurityEvent hooks (immutability audit trail)
  ☐ 15:00-17:00: Full integration tests (all 10 models, 250+ test cases)

JOUR 5 (Vendredi):
  ☐ 09:00-11:00: Complete test suite + coverage report
  ☐ 11:00-12:00: Code review + lint checks
  ☐ 12:00-13:00: LUNCH
  ☐ 13:00-15:00: Commit Phase 3 + final validation
  ☐ 15:00-17:00: Prepare Phase 4 (frontend integration)

TOTAL PHASE 3b: 8 heures ✅
```

---

## 🧪 TEST STRATEGY PHASE 3

### Hook Testing Framework

```javascript
// cascade/tests/phase3-hooks.test.js

describe('Phase 3: Hooks Implementation', () => {
  // User hooks
  describe('User.beforeCreate', () => {
    test('should hash password before create', async () => {
      const user = await User.create({
        email: 'test@test.com',
        username: 'test',
        password: 'plaintext123',
        groupeEntrepriseId: 1,
        roleId: 1
      });
      
      // Password should be hashed
      expect(user.password).not.toBe('plaintext123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash
    });
    
    test('should normalize email to lowercase', async () => {
      const user = await User.create({
        email: 'TEST@TEST.COM',
        username: 'test',
        password: 'pwd123',
        groupeEntrepriseId: 1,
        roleId: 1
      });
      
      expect(user.email).toBe('test@test.com');
    });
  });
  
  // JournalEntry hooks (complex)
  describe('JournalEntry.beforeUpdate', () => {
    test('should prevent status DRAFT→POSTED without balance', async () => {
      const entry = await JournalEntry.create({
        compagnieId: 1,
        createdById: 1,
        description: 'Test entry',
        status: 'DRAFT'
      });
      
      // Add only one line (need at least 2)
      await JournalEntryLine.create({
        journalEntryId: entry.id,
        chartOfAccountId: 1,
        debitAmount: 100
      });
      
      // Should throw
      await expect(
        entry.update({ status: 'POSTED' })
      ).rejects.toThrow('At least 2 lines required');
    });
    
    test('should allow status DRAFT→POSTED with balanced lines', async () => {
      const entry = await JournalEntry.create({
        compagnieId: 1,
        createdById: 1,
        status: 'DRAFT'
      });
      
      // Add 2 balanced lines
      await JournalEntryLine.create({
        journalEntryId: entry.id,
        chartOfAccountId: 1,
        debitAmount: 100
      });
      await JournalEntryLine.create({
        journalEntryId: entry.id,
        chartOfAccountId: 2,
        creditAmount: 100
      });
      
      // Should succeed
      await entry.update({ status: 'POSTED' });
      expect(entry.status).toBe('POSTED');
    });
  });
  
  // More tests...
});
```

---

## ✅ SUCCESS CRITERIA PHASE 3

### Phase 3a DONE if:
```
✅ 6 prioritaire models avec hooks implémentés
✅ 40+ hooks avec validations métier
✅ 150+ test cases passing
✅ beforeCreate/beforeUpdate/afterCreate/beforeDestroy tous testés
✅ Audit trail logging pour tous les models
✅ SecurityEvent integration complete
✅ Score progression: 85 → 90/100
✅ Zero breaking changes (backward compatible)
```

### Phase 3b DONE if:
```
✅ 10 models (all) avec hooks complete
✅ 250+ test cases passing (85%+ coverage)
✅ Integration tests (multi-model workflows)
✅ Soft delete paranoid mode verified
✅ Audit trail immutability enforced
✅ All linting passes (0 errors)
✅ npm run test:all passes
✅ Score: 92/100 (target reached)
✅ READY FOR PHASE 4
```

---

## 🚨 CRITICAL PATTERNS

### Pattern 1: Before/After Hook Order
```javascript
// ✅ CORRECT: Before modifies, After logs
beforeCreate: [ /* validation + normalization */ ]
afterCreate: [ /* logging */ ]

// ❌ WRONG: Logging in before (performance issue)
```

### Pattern 2: Audit Trail Integration
```javascript
// ✅ Create audit trail in beforeUpdate
beforeUpdate: async (model) => {
  if (model.changed()) {
    await AuditTrail.create({
      oldValues: model._previousDataValues,
      newValues: model.dataValues,
      // ...
    });
  }
}
```

### Pattern 3: Immutability Enforcement
```javascript
// ✅ Throw error for immutable fields
beforeUpdate: async (model) => {
  if (model.changed('immutableField')) {
    throw new Error('Field immutable');
  }
}
```

### Pattern 4: Paranoid (Soft Delete)
```javascript
// ✅ Use paranoid: true on critical models
sequelize.define('Model', { /* ... */ }, {
  paranoid: true,  // Enables soft delete
  timestamps: true
});

// Before destroy validates business rules
beforeDestroy: async (model) => {
  // Check dependencies, constraints, etc.
}
```

---

## 📊 HOOKS SUMMARY TABLE

| Model | beforeCreate | beforeUpdate | afterCreate | beforeDestroy | Total |
|-------|---|---|---|---|---|
| User | ✅ | ✅ | ✅ | ✅ | 4 |
| Compagnie | ✅ | ✅ | ✅ | - | 3 |
| JournalEntry | ✅ | ✅ | ✅ | - | 3 |
| ChartOfAccount | ✅ | ✅ | - | - | 2 |
| JournalEntryLine | ✅ | ✅ | - | - | 2 |
| ThirdParty | ✅ | ✅ | - | - | 2 |
| AccountBalance | ✅ | ✅ | - | - | 2 |
| AppSettings | ✅ | ✅ | - | - | 2 |
| Role | ✅ | ✅ | - | - | 2 |
| SecurityEvent | - | ❌ throws | - | - | 1 |
| **TOTAL** | **10** | **10** | **3** | **1** | **24** |

---

## 🎯 NEXT IMMEDIATE STEPS

### NOW (25 Jan, before Phase 3):
```
1. ✅ Read this document (you are here)
2. ⏳ Finish Phase 2b renaming (15 min):
   - Replace company.model.js with compagnie.model.js
   - Replace appSetting.model.js with appSettings.model.js
   - Update imports in index.js + controllers
3. ✅ Mark Phase 2b complete in todo list
4. 🚀 START PHASE 3 MONDAY 09:00
```

### MONDAY 26 JAN (09:00):
```
Phase 2b FINALE (09:00-09:30):
  - Finish renaming if not done
  - Run association tests
  - npm run test:all (baseline)
  - Commit Phase 2b

Phase 3a START (09:30-17:00):
  - Implement User hooks (complete)
  - Implement Compagnie hooks (complete)
  - Run tests (50+ passing)
  - Commit progress
```

---

## 💡 KEY CONCEPTS

### Non-Destructive Approach
- All hooks ADDED to existing models
- NO schema changes
- NO breaking API changes
- Backward compatible with current code

### Intelligent Implementation
- Hooks follow table documentation specs
- Validation rules from Phase 1 docs
- Business logic from OHADA standards
- Audit trail patterns established

### Coherent Architecture
- All hooks follow same pattern
- Consistent error messages
- Consistent audit trail structure
- Consistent SecurityEvent logging

### Application Aligned
- User auth flow respected
- Journal entry workflow (DRAFT→POSTED)
- OHADA accounting standards
- Multi-tenant architecture (groupes_entreprises)

---

**Ready for Phase 3?** 🚀

Let's start with **finishing Phase 2b quickly**, then launching Phase 3 full speed! 💪

