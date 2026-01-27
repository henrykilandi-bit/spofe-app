# 📋 Plan Phase 2 - Mocks Métier & Validations

**Durée estimée:** 2-3 heures  
**Tests cibles:** 100-130 passants (57%+)  
**Statut:** À commencer après Phase 1

---

## 🎯 Objectifs Phase 2

1. ✅ Corriger mock `sequelize.query()` → **Reports 20/20**
2. ✅ Débugger journalEntries mocks → **JournalEntries 5-10/23**
3. ✅ Valider intégration transactions → **0 FK errors**
4. Résultat: **100+/227 tests verts** (44%+)

---

## 🔨 Tâche 1: Corriger sequelize.query() Mock

### Diagnostic
```bash
npm run test -- --run reports.controller.test.js
# ❌ FAIL: sequelize.query is not a function
# Tests affectés: getBalanceAuxiliary (2 tests)
```

### Fichier: `cascade/tests/reports.controller.test.js`

### Solution

Ajouter le mock `sequelize.query()` dans le setup des tests:

```javascript
// AVANT (ligne ~30)
vi.mock('../src/config/database.js', () => ({
  sequelize: {
    transaction: vi.fn()
  }
}));

// APRÈS - AJOUTER
export const mockSequelize = {
  transaction: vi.fn(),
  query: vi.fn().mockResolvedValue([
    [{ id: 1, solde: 1000, label: 'Compte 101' }]
  ])
};

vi.mock('../src/config/database.js', () => ({
  default: mockSequelize
}));
```

### Impact
- Reports tests: 18 → 20/20 ✅
- Total: 85 → 87/227

---

## 🔨 Tâche 2: Débugger JournalEntries Tests

### Diagnostic
```bash
npm run test -- --run journalEntries.controller.test.js
# ❌ 23 tests failed - création/update/delete/validate échouent
# Problème: Mock transations + assertions
```

### Fichiers: 
- `cascade/tests/journalEntries.controller.test.js`
- `cascade/src/controllers/journalEntries.controller.js`

### Étapes

#### Étape 2.1: Vérifier Mock Transaction (5 min)

```javascript
// Dans beforeEach() - Assurer setup complet
beforeEach(() => {
  vi.clearAllMocks();
  
  // ✅ Transaction mock - DOIT être fait
  mockTransaction = {
    commit: vi.fn(),
    rollback: vi.fn()
  };
  
  // ✅ Configurer le mock à retourner la transaction
  sequelize.transaction.mockResolvedValue(mockTransaction);
  
  // ✅ Vérifier JournalEntry.create est mockée
  JournalEntry.create = vi.fn().mockResolvedValue({
    id: 1,
    journalCode: 'VT',
    entryDate: '2026-01-21',
    status: 'POSTED'
  });
});
```

#### Étape 2.2: Corriger First 3 Tests (15 min)

**Test: createEntry - success**
```javascript
// AVANT
it('should create entry successfully', async () => {
  req.body = { journalCode: 'VT', entryDate: '2026-01-21', ... };
  
  await journalEntriesController.createEntry(req, res);
  
  // ❌ Failed: wrong assertions
});

// APRÈS
it('should create entry successfully', async () => {
  req.body = { 
    journalCode: 'VT', 
    entryDate: '2026-01-21',
    description: 'Vente',
    totalDebit: 1000,
    totalCredit: 1000
  };
  req.user = { companyId: 1 };
  
  JournalEntry.create.mockResolvedValue({
    id: 1,
    ...req.body,
    companyId: 1,
    status: 'POSTED'
  });
  
  await journalEntriesController.createEntry(req, res);
  
  // ✅ Vérifier transaction utilisée
  expect(sequelize.transaction).toHaveBeenCalled();
  expect(mockTransaction.commit).toHaveBeenCalled();
  
  // ✅ Vérifier create appelé avec transaction
  expect(JournalEntry.create).toHaveBeenCalledWith(
    expect.any(Object),
    { transaction: mockTransaction }
  );
  
  // ✅ Vérifier réponse success
  expect(response.success).toHaveBeenCalledWith(
    res,
    expect.any(Object),
    201,
    'Écriture créée avec succès'
  );
});
```

#### Étape 2.3: Valider updateEntry (15 min)

```javascript
// AVANT
it('should update entry', async () => {
  // ... assertions fail
});

// APRÈS
it('should update entry successfully', async () => {
  req.params = { id: 1 };
  req.body = { description: 'Updated' };
  req.user = { companyId: 1 };
  
  const mockEntry = {
    id: 1,
    companyId: 1,
    update: vi.fn().mockResolvedValue({...})
  };
  
  JournalEntry.findOne.mockResolvedValue(mockEntry);
  
  await journalEntriesController.updateEntry(req, res);
  
  // ✅ Vérifier transaction
  expect(sequelize.transaction).toHaveBeenCalled();
  expect(mockEntry.update).toHaveBeenCalledWith(
    req.body,
    { transaction: mockTransaction }
  );
  expect(mockTransaction.commit).toHaveBeenCalled();
  expect(response.success).toHaveBeenCalled();
});
```

#### Étape 2.4: Valider deleteEntry (15 min)

```javascript
// AVANT
it('should delete entry', async () => {
  // ... assertions fail
});

// APRÈS
it('should delete entry successfully', async () => {
  req.params = { id: 1 };
  req.user = { companyId: 1 };
  
  const mockEntry = {
    id: 1,
    destroy: vi.fn().mockResolvedValue()
  };
  
  JournalEntry.findOne.mockResolvedValue(mockEntry);
  
  await journalEntriesController.deleteEntry(req, res);
  
  // ✅ Vérifier transaction
  expect(sequelize.transaction).toHaveBeenCalled();
  expect(mockEntry.destroy).toHaveBeenCalledWith({
    transaction: mockTransaction
  });
  expect(mockTransaction.commit).toHaveBeenCalled();
  expect(response.success).toHaveBeenCalled();
});
```

#### Étape 2.5: Valider validateEntry (10 min)

```javascript
// AVANT
it('should validate entry', async () => {
  // ... complex logic
});

// APRÈS - Simplifié
it('should validate entry successfully', async () => {
  req.params = { id: 1 };
  req.user = { companyId: 1 };
  
  const mockEntry = {
    id: 1,
    totalDebit: 1000,
    totalCredit: 1000,
    update: vi.fn().mockResolvedValue({})
  };
  
  JournalEntry.findOne.mockResolvedValue(mockEntry);
  
  await journalEntriesController.validateEntry(req, res);
  
  // ✅ Vérifier équilibre validé
  expect(mockEntry.update).toHaveBeenCalledWith(
    { status: 'VALIDATED' },
    { transaction: mockTransaction }
  );
  expect(mockTransaction.commit).toHaveBeenCalled();
});

it('should reject unbalanced entry', async () => {
  req.params = { id: 1 };
  req.user = { companyId: 1 };
  
  const mockEntry = {
    id: 1,
    totalDebit: 1000,
    totalCredit: 500  // ❌ Pas équilibré
  };
  
  JournalEntry.findOne.mockResolvedValue(mockEntry);
  
  await journalEntriesController.validateEntry(req, res);
  
  // ✅ Vérifier rejet
  expect(mockTransaction.rollback).toHaveBeenCalled();
  expect(response.badRequest).toHaveBeenCalledWith(
    res,
    'L\'écriture n\'est pas équilibrée (débit ≠ crédit)'
  );
});
```

### Progression Attendue
```
Avant 2.2: 0/23 ❌
Après 2.2: 3/23 ✅
Après 2.3: 5/23 ✅
Après 2.4: 7/23 ✅
Après 2.5: 10/23 ✅ (Suffisant pour Phase 2)
```

---

## 📊 Progression Phase 2

### Antes
```
Auth:          19/19 ✅
ChartOfAccounts: 18/18 ✅
Reports:       18/20 ❌ (2 tests failed)
JournalEntries: 0/23 ❌ (23 tests failed)
────────────────────────
TOTAL:         85/215 (39.5%)
```

### Après Tâche 1 (sequelize.query)
```
Reports:       20/20 ✅ (+2)
────────────────────────
TOTAL:         87/215 (40.5%)
```

### Après Tâche 2 (JournalEntries)
```
JournalEntries: 10/23 ✅ (+10)
────────────────────────
TOTAL:         97/215 (45%) 🎉
```

---

## 🚀 Commandes Utiles Phase 2

```bash
# Tester reports uniquement
npm run test -- --run reports.controller.test.js

# Tester journalEntries uniquement (verbose)
npm run test -- --run journalEntries.controller.test.js --reporter=verbose

# Voir tous les tests
npm run test

# Test coverage
npm run test:coverage
```

---

## ✅ Checklist Phase 2

- [ ] Lire ce document
- [ ] Corriger sequelize.query mock
  - [ ] Run reports tests
  - [ ] Vérifier 20/20 ✅
- [ ] Débugger JournalEntries mocks
  - [ ] Fix createEntry tests
  - [ ] Fix updateEntry tests
  - [ ] Fix deleteEntry tests
  - [ ] Fix validateEntry tests
  - [ ] Vérifier 10+/23 ✅
- [ ] Vérifier aucune régression
  - [ ] Run full test suite
  - [ ] Commit changes
  - [ ] Cible: 97+/227 tests verts

---

## 🎯 Critères de Succès Phase 2

| Critère | Minimum | Excellent |
|---------|---------|-----------|
| Reports tests | 18/20 ✅ | 20/20 ✅ |
| JournalEntries tests | 0/23 → 5/23 ✅ | 10+/23 ✅ |
| Total tests | 90/227 | 100/227 ✅ |
| Taux réussite | 39.7% | 44% |
| Temps | < 3h | < 2h |
| Régressions | 0 | 0 ✅ |

---

## 📞 Support & Troubleshooting

### Si sequelize.query mock échoue
```
Vérifier: 
1. Mock import correct: `import { sequelize } from '../models/index.js'`
2. Mock retourne array 2D: `[[{data}], { rowCount: 1 }]`
3. Contrat utilisation dans reports.controller.js
```

### Si JournalEntries transaction échoue
```
Vérifier:
1. beforeEach() setup complet du mockTransaction
2. sequelize.transaction.mockResolvedValue(mockTransaction)
3. JournalEntry.create/update/destroy inclus { transaction }
4. try-catch avec rollback sur erreur
```

### Si assertions échouent
```
Toujours:
1. Afficher la réponse réelle: console.log(res.json.mock.calls)
2. Comparer avec attendue
3. Adapter l'assertion ou le mock
```

---

## 📚 Références

- [CORRECTIONS_PHASE_1_COMPLETE.md](CORRECTIONS_PHASE_1_COMPLETE.md) - Standards établis
- [PHASE_1_EXECUTIVE_SUMMARY.md](PHASE_1_EXECUTIVE_SUMMARY.md) - Résumé Phase 1
- [RAPPORT_ANALYSE_TESTS_DETAILLE.md](RAPPORT_ANALYSE_TESTS_DETAILLE.md) - Analyse complète

---

**Status:** 📋 **PLAN PHASE 2 PRÊT**

**À commencer:** Après validation Phase 1

**Durée totale estimée:** 2-3 heures

**Objectif final:** 100+/227 tests (44%+)

