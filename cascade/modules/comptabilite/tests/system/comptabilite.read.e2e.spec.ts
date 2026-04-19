/**
 * 🧪 Tests System E2E - Comptabilité Read-Only
 * 
 * Tests end-to-end de la chaîne complète :
 * Guardian → Projection → Repository → API
 * 
 * Validation que :
 * - une écriture validée par le Guardian
 * - est correctement projetée
 * - est lisible via le repository
 * - est exposée telle quelle par l'API
 * 
 * ZÉRO write - ZÉRO logique cachée
 */

import { AccountingGuardian } from '../../src/guardian/AccountingGuardian';
import { CloseAccountingPeriod } from '../../src/application/CloseAccountingPeriod';
import { AccountingPeriodProjection } from '../../src/read-models/projections/AccountingPeriodProjection';
import { initAccountingPeriodRM } from '../../src/read-models/projections';
import { InMemoryAccountingReadRepository } from '../../src/read-models/InMemoryAccountingReadRepository';
import { AccountingReadController } from '../../src/api/AccountingReadController';

import { validOpenPeriod } from '../guardian/fixtures/validPeriod';
import { validEntry } from '../guardian/fixtures/validEntry';

describe('🧪 E2E — Comptabilité Générale (read-only)', () => {

  test('Chaîne complète : Guardian → Projection → Repository → API', () => {

    /* =========================
       1. Guardian valide l'écriture
       ========================= */

    const period = validOpenPeriod();
    const entry = validEntry();

    // Le Guardian doit valider l'écriture sans lever d'exception
    expect(() =>
      AccountingGuardian.validateNewEntry(period, entry)
    ).not.toThrow();

    /* =========================
       2. Projection read-model
       ========================= */

    // Initialiser la période projetée
    let periodRM = initAccountingPeriodRM(period.periodId);
    
    // Appliquer l'écriture validée à la projection
    periodRM = AccountingPeriodProjection.applyEntry(
      periodRM,
      entry
    );

    // Vérifier que la projection a créé 2 lignes (1 par ligne comptable)
    expect(periodRM.entries.length).toBe(2);
    
    // Vérifier la structure des entrées projetées
    expect(periodRM.entries[0]).toHaveProperty('entryId', 'E-001');
    expect(periodRM.entries[0]).toHaveProperty('accountCode', '411');
    expect(periodRM.entries[0]).toHaveProperty('debit', 1200);
    expect(periodRM.entries[0]).toHaveProperty('credit', 0);
    
    expect(periodRM.entries[1]).toHaveProperty('accountCode', '706');
    expect(periodRM.entries[1]).toHaveProperty('debit', 0);
    expect(periodRM.entries[1]).toHaveProperty('credit', 1200);

    /* =========================
       3. Repository read-only
       ========================= */

    // Créer le repository avec la période projetée
    const repository = new InMemoryAccountingReadRepository([
      periodRM
    ]);

    // Tester la lecture par période
    const entriesByPeriod = repository.findEntriesByPeriod(period.periodId);
    expect(entriesByPeriod.length).toBe(2);

    // Tester la filtration par compte
    const entriesByAccount = repository.findEntriesByAccount(period.periodId, '411');
    expect(entriesByAccount.length).toBe(1);
    expect(entriesByAccount[0].debit).toBe(1200);
    expect(entriesByAccount[0].credit).toBe(0);

    // Tester la filtration par tiers
    const entriesByTier = repository.findEntriesByTier(period.periodId, 'C-001');
    expect(entriesByTier.length).toBe(1);
    expect(entriesByTier[0].tierId).toBe('C-001');

    /* =========================
       4. API read-only
       ========================= */

    // Créer le controller avec le repository
    const controller = new AccountingReadController(repository);

    // Tester l'exposition via l'API
    const apiEntries = controller.getEntriesByPeriod(period.periodId);
    expect(apiEntries.length).toBe(2);
    
    // Vérifier que l'API expose bien les propriétés attendues
    expect(apiEntries[0]).toHaveProperty('entryId');
    expect(apiEntries[0]).toHaveProperty('accountCode');
    expect(apiEntries[0]).toHaveProperty('debit');
    expect(apiEntries[0]).toHaveProperty('credit');
    expect(apiEntries[0]).toHaveProperty('sourceModule');
    expect(apiEntries[0]).toHaveProperty('sourceId');

    // Vérifier que l'API par compte fonctionne
    const apiAccountEntries = controller.getEntriesByAccount(period.periodId, '411');
    expect(apiAccountEntries.length).toBe(1);
    expect(apiAccountEntries[0].accountCode).toBe('411');

    // Vérifier que l'API par tiers fonctionne
    const apiTierEntries = controller.getEntriesByTier(period.periodId, 'C-001');
    expect(apiTierEntries.length).toBe(1);
    expect(apiTierEntries[0].tierId).toBe('C-001');
  });

  test('Intégrité des données à travers la chaîne', () => {
    // Vérifier que les données ne sont pas altérées
    const period = validOpenPeriod();
    const entry = validEntry();

    // Validation Guardian
    AccountingGuardian.validateNewEntry(period, entry);

    // Projection
    const periodRM = AccountingPeriodProjection.applyEntry(
      initAccountingPeriodRM(period.periodId),
      entry
    );

    // Repository
    const repository = new InMemoryAccountingReadRepository([periodRM]);
    const repoEntries = repository.findEntriesByPeriod(period.periodId);

    // API
    const controller = new AccountingReadController(repository);
    const apiEntries = controller.getEntriesByPeriod(period.periodId);

    // Vérifier l'intégrité : même données, même ordre
    expect(repoEntries).toEqual(apiEntries);
    
    // Vérifier que les montants sont préservés
    const totalDebit = apiEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = apiEntries.reduce((sum, e) => sum + e.credit, 0);
    expect(totalDebit).toBe(1200);
    expect(totalCredit).toBe(1200);
  });

  test('Repository et API exposent une période absente sans interprétation', () => {
    const repository = new InMemoryAccountingReadRepository([]);
    const controller = new AccountingReadController(repository);

    expect(repository.findPeriod('UNKNOWN')).toBeNull();
    expect(repository.findEntriesByPeriod('UNKNOWN')).toEqual([]);
    expect(controller.getPeriod('UNKNOWN')).toBeNull();
    expect(controller.getEntriesByPeriod('UNKNOWN')).toEqual([]);
  });

  test('Repository addPeriod et clear pilotent correctement la lecture API', () => {
    const repository = new InMemoryAccountingReadRepository([]);
    const controller = new AccountingReadController(repository);
    const period = initAccountingPeriodRM('2026-02');

    repository.addPeriod(period);

    expect(controller.getPeriod('2026-02')).toEqual(period);

    repository.clear();

    expect(controller.getPeriod('2026-02')).toBeNull();
    expect(controller.getEntriesByPeriod('2026-02')).toEqual([]);
  });

  test('Projection conserve séparément les écritures de périodes distinctes', () => {
    const firstEntry = validEntry();
    const secondEntry = {
      ...validEntry(),
      entryId: 'E-002',
      periodId: '2026-02',
      documentRef: 'DOC-002'
    };

    const periodOne = AccountingPeriodProjection.applyEntry(
      initAccountingPeriodRM('2026-01'),
      firstEntry
    );
    const periodTwo = AccountingPeriodProjection.applyEntry(
      initAccountingPeriodRM('2026-02'),
      secondEntry
    );

    const repository = new InMemoryAccountingReadRepository([periodOne, periodTwo]);
    const controller = new AccountingReadController(repository);

    expect(controller.getEntriesByPeriod('2026-01')).toHaveLength(2);
    expect(controller.getEntriesByPeriod('2026-02')).toHaveLength(2);
    expect(controller.getEntriesByPeriod('2026-02')[0].periodId).toBe('2026-02');
  });

  test('Rejet par Guardian bloque toute la chaîne', () => {
    const period = validOpenPeriod();
    const invalidEntry = validEntry();
    
    // Rendre l'écriture invalide (déséquilibrée)
    invalidEntry.lines[1].credit = 1000;

    // Le Guardian doit rejeter
    expect(() =>
      AccountingGuardian.validateNewEntry(period, invalidEntry)
    ).toThrow();

    // La chaîne doit être vide (pas de projection, pas de lecture)
    const periodRM = initAccountingPeriodRM(period.periodId);
    const repository = new InMemoryAccountingReadRepository([periodRM]);
    const controller = new AccountingReadController(repository);
    
    const entries = controller.getEntriesByPeriod(period.periodId);
    expect(entries.length).toBe(0);
  });

  test('open -> close -> write forbidden -> read closed', () => {
    const period = validOpenPeriod();
    const closeUseCase = new CloseAccountingPeriod();

    const closedPeriod = closeUseCase.execute({
      period,
      closedBy: 'admin',
      closedAt: '2026-01-31T23:59:59Z'
    });

    expect(closedPeriod.status).toBe('CLOSED');
    expect(() => AccountingGuardian.validateNewEntry(closedPeriod, validEntry())).toThrow();

    let periodRM = initAccountingPeriodRM(closedPeriod.periodId);
    periodRM = AccountingPeriodProjection.closePeriod(periodRM);

    const repository = new InMemoryAccountingReadRepository([periodRM]);
    const controller = new AccountingReadController(repository);
    const exposedPeriod = controller.getPeriod(closedPeriod.periodId);

    expect(exposedPeriod).not.toBeNull();
    expect(exposedPeriod?.status).toBe('CLOSED');
  });

  test('defense-in-depth — repository filters malformed read entries', () => {
    const leakyPeriod = initAccountingPeriodRM('2026-03');
    leakyPeriod.entries = [
      {
        entryId: 'E-VALID',
        periodId: '2026-03',
        journalCode: 'VE',
        entryDate: '2026-03-10',
        accountCode: '411',
        debit: 500,
        credit: 0,
        tierId: 'C-777',
        documentRef: 'DOC-777',
        sourceModule: 'precomptabilite',
        sourceId: 'DOC-777',
        createdAt: '2026-03-10T10:00:00Z',
      },
      {
        entryId: 'E-WRONG-PERIOD',
        periodId: '2026-04',
        journalCode: 'VE',
        entryDate: '2026-03-10',
        accountCode: '706',
        debit: 0,
        credit: 500,
        documentRef: 'DOC-777',
        sourceModule: 'precomptabilite',
        sourceId: 'DOC-777',
        createdAt: '2026-03-10T10:00:00Z',
      },
      {
        entryId: 'E-INVALID-AMOUNT',
        periodId: '2026-03',
        journalCode: 'VE',
        entryDate: '2026-03-10',
        accountCode: '512',
        debit: -50,
        credit: 0,
        documentRef: 'DOC-778',
        sourceModule: 'precomptabilite',
        sourceId: 'DOC-778',
        createdAt: '2026-03-10T10:00:00Z',
      },
    ];

    const repository = new InMemoryAccountingReadRepository([leakyPeriod]);
    const controller = new AccountingReadController(repository);

    const entries = controller.getEntriesByPeriod('2026-03');
    expect(entries).toHaveLength(1);
    expect(entries[0].entryId).toBe('E-VALID');

    const period = controller.getPeriod('2026-03');
    expect(period?.entries).toHaveLength(1);
  });

});
