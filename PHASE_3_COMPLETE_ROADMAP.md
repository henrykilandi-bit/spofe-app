# 🔧 PHASE 3 COMPLETE ROADMAP - HOOKS IMPLEMENTATION

**Phases**: 3a + 3b (16 hours total, Mon-Fri 26-30 Jan)  
**Target**: 10 models, 40+ hooks, 250+ tests  
**Score**: 85 → 92/100 (+7 points)  
**Status**: ✅ READY TO LAUNCH

---

## 📊 HOOKS IMPLEMENTATION MATRIX

### Phase 3a: 6 CRITICAL MODELS (Mon-Wed, 8h)

| Model | beforeCreate | beforeUpdate | afterCreate | beforeDestroy | Total | Priority |
|-------|---|---|---|---|---|---|
| **User** | ✅ Hash pwd | ✅ Audit trail | ✅ SecurityEvent | ✅ Safeguard | 4 | CRITICAL |
| **Compagnie** | ✅ Normalize | ✅ Immutable curr | ✅ SecurityEvent | - | 3 | CRITICAL |
| **JournalEntry** | ✅ Status DRAFT | ✅ Workflow (POSTED) | ✅ SecurityEvent | ✅ Lock POSTED | 4 | CRITICAL |
| **ChartOfAccount** | ✅ OHADA format | ✅ Immutable number | - | - | 2 | CRITICAL |
| **JournalEntryLine** | ✅ XOR validation | ✅ XOR check | - | - | 2 | CRITICAL |
| **ThirdParty** | ✅ Type validate | ✅ Audit trail | - | - | 2 | CRITICAL |
| **TOTAL** | 6 | 6 | 3 | 2 | **17** | |

### Phase 3b: 4 SUPPORTING MODELS (Thu-Fri, 8h)

| Model | beforeCreate | beforeUpdate | afterCreate | beforeDestroy | Total | Priority |
|-------|---|---|---|---|---|---|
| **AccountBalance** | ✅ Validate | ✅ Immutable final | - | - | 2 | IMPORTANT |
| **AppSettings** | ✅ System protect | ✅ System immutable | - | - | 2 | IMPORTANT |
| **Role** | ✅ Name unique | ✅ System immutable | - | - | 2 | IMPORTANT |
| **SecurityEvent** | - | ❌ Immutable (throw) | - | - | 1 | CRITICAL |
| **TOTAL** | 3 | 3 | - | - | **8** | |

### GRAND TOTAL: 25+ HOOKS, 10 MODELS

```
beforeCreate hooks:  9 (validation + normalization)
beforeUpdate hooks:  9 (audit trail + immutability)
afterCreate hooks:   3 (security events)
beforeDestroy hooks: 2 (soft delete safeguards)
IMMUTABLE (throw):   1 (SecurityEvent)

Total: 24 hooks + 1 immutable error = 25 hook functions
```

---

## ⏱️ DETAILED TIMELINE

### MONDAY 26 JAN

```
09:00-09:30  Kickoff standup
  - Verify Phase 2 complete
  - Review PHASE_3a_START_CHECKLIST.md
  - Confirm environment ready

09:30-11:00  User.model.js Hooks (1.5h)
  ✅ beforeCreate: password hash + email normalize + roleId validate
  ✅ beforeUpdate: audit trail + re-hash if changed
  ✅ afterCreate: log user_created SecurityEvent
  ✅ beforeDestroy: check no active entries

11:00-12:00  User Hooks Tests (1h)
  - 50+ test cases
  - Password hashing verification
  - Soft delete safeguard tests
  → npm test -- User.hooks.test.js --coverage

12:00-13:00  LUNCH

13:00-14:30  Compagnie.model.js Hooks (1.5h)
  ✅ beforeCreate: normalize code + validate group + validate currency
  ✅ beforeUpdate: immutable currency + audit trail
  ✅ afterCreate: log compagnie_created SecurityEvent
  ✅ beforeDestroy: check no active entries

14:30-15:30  Compagnie Tests (1h)
  - 40+ test cases
  - Code normalization (UPPERCASE)
  - Currency immutability
  → npm test -- Compagnie.hooks.test.js --coverage

15:30-17:00  Commit + Documentation (1.5h)
  git commit -m "User + Compagnie hooks: 7 hooks, 90+ tests"
  git tag v2.2-phase3a-user-compagnie
  → DAYEND: User + Compagnie hooks COMPLETE ✅
```

**Day 1 KPIs**:
- ✅ 2 models completed
- ✅ 7 hooks implemented
- ✅ 90+ tests passing
- ✅ 100% coverage per model
- ✅ 0 lint errors
- ✅ Score progression: 85 → 85.5/100

---

### TUESDAY 27 JAN

```
09:00-11:00  JournalEntry.model.js Hooks (2h) - MOST COMPLEX
  ✅ beforeCreate: compagnieId validate + status = DRAFT + createdById validate
  ✅ beforeUpdate: DRAFT→POSTED validation
       - Minimum 2 lines required
       - Balance check: debit = credit (precision 0.01)
       - Cannot modify POSTED entries
       - Create AuditTrail with status change
  ✅ afterCreate: log journal_entry_created SecurityEvent
  ✅ beforeDestroy: cannot delete POSTED entries
  🔥 100+ test cases (complex workflow)

11:00-12:00  JournalEntry Tests Part 1 (1h)
  - DRAFT status auto-set
  - DRAFT→POSTED requires 2+ lines
  - DRAFT→POSTED requires balance
  - Precision validation (0.01)
  → npm test -- JournalEntry.hooks (Part 1)

12:00-13:00  LUNCH

13:00-14:30  ChartOfAccount.model.js Hooks (1.5h)
  ✅ beforeCreate: OHADA format (1-8 digits) + type validate + uniqueness per company
  ✅ beforeUpdate: immutable account number + immutable type + audit trail
  ✅ beforeDestroy: cannot delete if has entries
  - 50+ test cases (OHADA compliance intensive)

14:30-15:30  JournalEntryLine.model.js Hooks (1h)
  ✅ beforeCreate: XOR validation (debit XOR credit) + CoA validate + parent entry DRAFT
  ✅ beforeUpdate: cannot modify if parent POSTED + maintain XOR
  - 40+ test cases (XOR validation intensive)

15:30-17:00  All Tests + Commit (1.5h)
  - JournalEntry full test suite (100+ cases)
  - ChartOfAccount tests (50+ cases)
  - JournalEntryLine tests (40+ cases)
  - npm test:all
  → DAYEND: 3 complex models COMPLETE ✅
```

**Day 2 KPIs**:
- ✅ 3 models completed (JournalEntry, ChartOfAccount, JournalEntryLine)
- ✅ 8 hooks implemented
- ✅ 190+ tests passing
- ✅ Complex workflows validated
- ✅ Score progression: 85.5 → 86.5/100

---

### WEDNESDAY 28 JAN

```
09:00-10:00  ThirdParty.model.js Hooks (1h)
  ✅ beforeCreate: type validate + credit limit >= 0 + phone normalize
  ✅ beforeUpdate: audit trail + credit limit validate
  ✅ beforeDestroy: cannot delete if has active invoices
  - 40+ test cases

10:00-11:00  Phase 3a Full Integration Tests (1h)
  🔥 Test all 6 models working together:
  
  Scenario 1: User creates company
    - User created → password hashed → SecurityEvent logged
    - Compagnie created → code normalized → AuditTrail logged
    - Status: ✅ integrated
  
  Scenario 2: Accounting workflow
    - Create JournalEntry (DRAFT)
    - Add ChartOfAccount lines (XOR validation)
    - Add JournalEntryLine (balanced)
    - POST entry → validate balance → update status
    - Verify AuditTrail has both CREATE and UPDATE
    - Status: ✅ integrated
  
  Scenario 3: Data immutability
    - Create ChartOfAccount
    - Try modify account_number → fails
    - Try modify account_type → fails
    - Status: ✅ immutable constraints work
  
  Scenario 4: Soft delete safeguards
    - Create User with active JournalEntry
    - Try delete User → fails (beforeDestroy check)
    - Status: ✅ safeguard works

11:00-12:00  Phase 3a Verification + Documentation (1h)
  - npm run lint (expect 0 errors)
  - npm run test:all --coverage (expect 95%+)
  - Verify no breaking changes
  - Document Phase 3a completion
  → MORNING COMPLETE ✅

12:00-13:00  LUNCH

13:00-14:00  Final Phase 3a Commit (1h)
  git add cascade/src/models/*.js
  git add cascade/tests/phase3a-*.test.js
  git commit -m "✅ Phase 3a Complete: 6 models, 24 hooks, 150+ tests"
  git tag v2.2-phase3a-complete

14:00-15:00  Phase 3b Preparation (1h)
  - Read PHASE_3_HOOKS_IMPLEMENTATION_DETAIL.md (Phase 3b section)
  - Review AccountBalance, AppSettings, Role, SecurityEvent
  - Plan Thursday-Friday execution

15:00-17:00  Free slot (buffer or early Phase 3b start)
  - Could start AccountBalance hooks early
  - Or rest/documentation

→ DAYEND: Phase 3a 100% COMPLETE ✅ Score: 87/100
```

**Day 3 KPIs**:
- ✅ Final model (ThirdParty) completed
- ✅ Integration tests all 6 models
- ✅ Phase 3a FINISHED: 150+ tests, 24 hooks
- ✅ Score: 87/100 (+2 from day 1)
- ✅ Ready for Phase 3b Friday

---

### THURSDAY 29 JAN

```
09:00-10:00  AccountBalance.model.js Hooks (1h)
  ✅ beforeCreate: validate compagnie + validate chart of account + initial balance
  ✅ beforeUpdate: immutability check (isFinal cannot change balance)
  ✅ beforeDestroy: check no dependent calculations
  - 30+ test cases

10:00-11:00  AppSettings.model.js Hooks (1h)
  ✅ beforeCreate: system setting immutability check + validate keys
  ✅ beforeUpdate: prevent system setting modification
  ✅ afterCreate: log setting change SecurityEvent
  - 30+ test cases

11:00-12:00  Role.model.js Hooks (1h)
  ✅ beforeCreate: validate role name unique + check not system role
  ✅ beforeUpdate: prevent system role modification (ADMIN, USER, VIEWER immutable)
  ✅ beforeDestroy: cannot delete system roles
  - 30+ test cases

12:00-13:00  LUNCH

13:00-14:00  SecurityEvent.model.js Hooks (1h)
  ✅ beforeUpdate: THROW ERROR (immutable audit log)
    - SecurityEvent cannot be modified after creation
    - Enforced immutability at database level
  ✅ beforeDestroy: log attempt but fail gracefully
  - 10+ test cases (immutability specific)

14:00-15:00  All Phase 3b Unit Tests (1h)
  - npm test -- "AccountBalance|AppSettings|Role|SecurityEvent" --coverage
  - Expected: 100+ tests, 95%+ coverage
  - All 4 models tested independently

15:00-17:00  Phase 3b + Full Integration (2h)
  - Run all 10 models together
  - 250+ test cases total (all models + integration)
  - npm run test:all --coverage
  - Expected: 250+/250 tests passing, 90%+ global coverage

→ DAYEND: Phase 3b all 4 models + integration COMPLETE ✅
```

**Day 4 KPIs**:
- ✅ 4 supporting models completed
- ✅ 8 additional hooks implemented
- ✅ 250+ total tests (all 10 models + integration)
- ✅ Full integration tests all passing
- ✅ Score progression: 87 → 90/100

---

### FRIDAY 30 JAN

```
09:00-10:00  Full QA + Code Review (1h)
  ✅ npm run lint → 0 errors expected
  ✅ npm run test:all → 250+ tests passing
  ✅ npm run test:all --coverage → 90%+ coverage
  ✅ Code review checklist:
     - All hooks follow same pattern
     - All error messages consistent
     - All AuditTrail logging complete
     - All SecurityEvent logging complete

10:00-11:00  Performance Verification (1h)
  ✅ Before/after performance:
     - Hook execution time < 10ms per request (acceptable)
     - Database queries optimized
     - No N+1 query problems
     - No circular dependencies

11:00-12:00  Documentation Updates (1h)
  ✅ Update all doc files with hooks implementation
  ✅ Create HOOKS_IMPLEMENTATION_SUMMARY.md (final status)
  ✅ Document all 25 hooks with patterns
  ✅ Create rollback procedure if needed

12:00-13:00  LUNCH

13:00-14:30  Final Commit + Tag (1.5h)
  git add cascade/src/models/*.js
  git add cascade/tests/phase3*-*.test.js
  git commit -m "✅ Phase 3 Complete: 10 models, 25 hooks, 250+ tests, 90%+ coverage"
  git tag v2.2-phase3-complete
  git log --oneline -10 (verify commit history)

14:30-15:30  Score Verification + Phase 4 Prep (1h)
  ✅ Verify score progression:
     Phase 1: 75/100
     Phase 2: 85/100
     Phase 3a: 87/100
     Phase 3b: 90/100
     Target Phase 4: 98/100
  
  ✅ Prepare Phase 4 (Frontend Integration)
     - Read PHASE_4_FRONTEND_INTEGRATION.md
     - Review DTO mapping patterns
     - Prepare E2E test framework

15:30-17:00  Weekly Summary + Weekend Prep (1.5h)
  ✅ Create PHASE_3_COMPLETION_REPORT.md
  ✅ Document lessons learned
  ✅ Identify any technical debt
  ✅ Confirm Phase 4 ready for Monday
  ✅ Rest & prepare for Week 2! 😴

→ EOW: Phase 3 100% COMPLETE ✅ Score: 92/100 🎉
```

**Day 5 KPIs**:
- ✅ All 10 models hooks FINALIZED
- ✅ 250+ tests PASSING
- ✅ 90%+ code coverage
- ✅ 0 lint errors
- ✅ Phase 3 COMPLETE
- ✅ Score: 92/100
- ✅ Ready for Phase 4 Monday

---

## 🎯 HOOKS PATTERNS (Reference)

### Pattern 1: beforeCreate (Validation + Normalization)

```javascript
beforeCreate: [
  async (model, options) => {
    // 1. Validate required fields
    if (!model.requiredField) throw new Error('Required');
    
    // 2. Normalize values
    model.email = model.email?.toLowerCase().trim();
    
    // 3. Hash sensitive data
    if (model.password) {
      const bcrypt = require('bcryptjs');
      model.password = await bcrypt.hash(model.password, 10);
    }
    
    // 4. Validate relationships
    if (model.foreignKeyId) {
      const related = await RelatedModel.findByPk(model.foreignKeyId);
      if (!related) throw new Error('Invalid FK');
    }
  }
]
```

### Pattern 2: beforeUpdate (Audit Trail + Immutability)

```javascript
beforeUpdate: [
  async (model, options) => {
    // 1. Check immutable fields
    if (model.changed('immutableField')) {
      throw new Error('Field is immutable');
    }
    
    // 2. Create audit trail
    if (model.changed()) {
      await AuditTrail.create({
        userId: model.userId || options.userId,
        entityType: 'ModelName',
        entityId: model.id,
        action: 'UPDATE',
        oldValues: model._previousDataValues,
        newValues: model.dataValues,
        changeSummary: `Updated: ${model.changed().join(', ')}`
      });
    }
    
    // 3. Validate state transitions
    if (model.changed('status')) {
      const validTransition = isValidStatusTransition(
        model._previousDataValues.status,
        model.status
      );
      if (!validTransition) throw new Error('Invalid status transition');
    }
  }
]
```

### Pattern 3: afterCreate (SecurityEvent Logging)

```javascript
afterCreate: [
  async (model, options) => {
    await SecurityEvent.create({
      userId: model.userId || options.userId,
      eventType: 'model_created',
      description: `${ModelName} created: ${model.name}`,
      severity: 'INFO',
      metadata: { modelId: model.id }
    });
  }
]
```

### Pattern 4: beforeDestroy (Soft Delete Safeguards)

```javascript
beforeDestroy: [
  async (model, options) => {
    // 1. Check for active related records
    const activeEntries = await RelatedModel.count({
      where: { parentId: model.id, status: 'ACTIVE' }
    });
    
    if (activeEntries > 0) {
      throw new Error(`Cannot delete: has ${activeEntries} active entries`);
    }
    
    // 2. Soft delete is enabled (paranoid: true)
    // Model will have deleted_at set instead of being removed
  }
]
```

---

## ✅ PHASE 3 SUCCESS CHECKLIST

### Code Implementation
- [ ] User hooks (4): beforeCreate, beforeUpdate, afterCreate, beforeDestroy
- [ ] Compagnie hooks (3): beforeCreate, beforeUpdate, afterCreate
- [ ] JournalEntry hooks (4): beforeCreate (complex), beforeUpdate (complex), afterCreate, beforeDestroy
- [ ] ChartOfAccount hooks (2): beforeCreate, beforeUpdate
- [ ] JournalEntryLine hooks (2): beforeCreate, beforeUpdate
- [ ] ThirdParty hooks (2): beforeCreate, beforeUpdate
- [ ] AccountBalance hooks (2): beforeCreate, beforeUpdate
- [ ] AppSettings hooks (2): beforeCreate, beforeUpdate
- [ ] Role hooks (2): beforeCreate, beforeUpdate
- [ ] SecurityEvent hooks (1): beforeUpdate throws error (immutable)

### Testing
- [ ] 150+ tests Phase 3a (6 models)
- [ ] 100+ tests Phase 3b (4 models)
- [ ] Integration tests (all 10 models together)
- [ ] 95%+ coverage per model
- [ ] 90%+ global coverage
- [ ] All test suites passing (npm run test:all)

### Code Quality
- [ ] 0 lint errors (npm run lint)
- [ ] All hooks follow same pattern
- [ ] Consistent error messages
- [ ] Consistent AuditTrail logging
- [ ] Consistent SecurityEvent logging
- [ ] No N+1 query problems
- [ ] Performance optimized (< 10ms per hook)

### Business Logic
- [ ] User password hashing (bcrypt 10 rounds)
- [ ] Email normalization (lowercase)
- [ ] JournalEntry workflow (DRAFT → POSTED → ARCHIVED)
- [ ] JournalEntry balance validation (debit = credit, 0.01 precision)
- [ ] OHADA account number validation (1-8 digits)
- [ ] XOR constraint (debit XOR credit, never both)
- [ ] Immutability enforcement (account number, currency, etc.)
- [ ] Soft delete safeguards (paranoid: true)

### Audit & Security
- [ ] AuditTrail created on all updates
- [ ] SecurityEvent logged on all creates
- [ ] oldValues, newValues, changeSummary populated
- [ ] SecurityEvent immutability enforced
- [ ] No sensitive data logged
- [ ] No passwords in logs

### Documentation
- [ ] PHASE_3_COMPLETION_REPORT.md created
- [ ] Hooks implementation summary documented
- [ ] Pattern examples documented
- [ ] Rollback procedure documented
- [ ] Lessons learned documented

### Version Control
- [ ] All changes committed with clear messages
- [ ] Phase 3a tagged: v2.2-phase3a-complete
- [ ] Phase 3b tagged: v2.2-phase3b-complete
- [ ] Phase 3 final tagged: v2.2-phase3-complete
- [ ] Git history clean and logical

---

## 📈 SCORE PROGRESSION

```
Phase 1 DONE:  75/100 (documentation)
Phase 2 DONE:  85/100 (models + renaming)
Phase 3a DONE: 87/100 (6 core models hooks)
Phase 3b DONE: 92/100 (4 supporting models hooks, integration)

Remaining for Phase 4: 92 → 98/100 (+6 points)
  - Frontend DTOs
  - E2E tests (50+ scenarios)
  - API validation
  - Final QA
```

---

## 🚀 READY TO LAUNCH

**Status**: ✅ ALL PREP COMPLETE  
**Start Date**: Lundi 26 Jan 09:00  
**Duration**: 16 hours over 5 days  
**Target**: 10 models, 25+ hooks, 250+ tests, 92/100 score

**Key Success Factors**:
- ✅ Phase 2 complete (no blockers)
- ✅ All 14 table docs prepared (business rules)
- ✅ Hook patterns documented
- ✅ Test strategy clear
- ✅ Timeline realistic with buffer
- ✅ Team aligned on non-destructive approach

**Let's launch Phase 3! 🔥**

