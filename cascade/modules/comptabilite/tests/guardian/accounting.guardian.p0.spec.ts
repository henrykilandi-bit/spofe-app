/**
 * 🧪 Guardian Comptabilité — Tests P0 Constitutionnels
 * 
 * Tests exécutables, bloquants, alignés 1-pour-1 avec le plan de tests.
 * Si un test échoue, le module est invalide.
 */

import { AccountingGuardian } from '../../src/guardian/AccountingGuardian';
import { GuardianViolation } from '../../src/shared/errors';
import { validOpenPeriod, validClosedPeriod, validLockedPeriod } from './fixtures/validPeriod';
import { validEntry, validSingleLineEntry, validUnbalancedEntry } from './fixtures/validEntry';

describe('🛡️ Guardian Comptabilité — Tests P0 Constitutionnels', () => {

  /* =========================
     A. Période (G-COMPTA-01)
     ========================= */

  test('P0-A01 — écriture autorisée si période OPEN', () => {
    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        validEntry()
      )
    ).not.toThrow();
  });

  test('P0-A02 — écriture refusée si période CLOSED', () => {
    const period = validClosedPeriod();

    expect(() =>
      AccountingGuardian.validateNewEntry(period, validEntry())
    ).toThrow(GuardianViolation);
  });

  test('P0-A03 — écriture refusée si période LOCKED', () => {
    const period = validLockedPeriod();

    expect(() =>
      AccountingGuardian.validateNewEntry(period, validEntry())
    ).toThrow(GuardianViolation);
  });

  /* =========================
     B. Partie double (G-COMPTA-05, 06, 07)
     ========================= */

  test('P0-B01 — moins de 2 lignes refusé', () => {
    const entry = validSingleLineEntry();

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entry
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-B02 — écriture non équilibrée refusée', () => {
    const entry = validUnbalancedEntry();

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entry
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-B03 — ligne débit et crédit refusée', () => {
    const entry = validEntry();
    entry.lines[0].credit = 10; // Ligne mixte

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entry
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-B04 — montant négatif refusé', () => {
    const entry = validEntry();
    entry.lines[0].debit = -100; // Montant négatif

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entry
      )
    ).toThrow(GuardianViolation);
  });

  /* =========================
     C. Traçabilité (G-COMPTA-11, 12, 13)
     ========================= */

  test('P0-C01 — source absente refusée', () => {
    const entry = validEntry();
    const entryWithoutSource = { ...entry };
    // @ts-ignore
    delete entryWithoutSource.source;

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entryWithoutSource
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-C02 — documentRef absent refusé', () => {
    const entry = validEntry();
    entry.documentRef = '';

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entry
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-C03 — createdAt absent refusé', () => {
    const entry = validEntry();
    const entryWithoutCreatedAt = { ...entry };
    // @ts-ignore
    delete entryWithoutCreatedAt.createdAt;

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entryWithoutCreatedAt
      )
    ).toThrow(GuardianViolation);
  });

  test('P0-C04 — createdBy absent refusé', () => {
    const entry = validEntry();
    const entryWithoutCreatedBy = { ...entry };
    // @ts-ignore
    delete entryWithoutCreatedBy.createdBy;

    expect(() =>
      AccountingGuardian.validateNewEntry(
        validOpenPeriod(),
        entryWithoutCreatedBy
      )
    ).toThrow(GuardianViolation);
  });

  /* =========================
     D. Tests de clôture
     ========================= */

  test('P0-D01 — clôture période OPEN réussie', () => {
    const period = validOpenPeriod();
    const closedPeriod = AccountingGuardian.closePeriod(period, 'admin', '2026-01-31T23:59:59Z');

    expect(closedPeriod.status).toBe('CLOSED');
    expect(closedPeriod.auditTrail).toHaveLength(1);
    expect(closedPeriod.auditTrail[0].event).toBe('PERIOD_CLOSED');
    expect(closedPeriod.auditTrail[0].by).toBe('admin');
  });

  test('P0-D01bis — clôture conserve les audits existants et ajoute un évènement', () => {
    const period = {
      ...validOpenPeriod(),
      auditTrail: [
        { event: 'PERIOD_OPENED', at: '2026-01-01T00:00:00Z', by: 'system' }
      ]
    };

    const closedPeriod = AccountingGuardian.closePeriod(period, 'admin', '2026-01-31T23:59:59Z');

    expect(closedPeriod.auditTrail).toHaveLength(2);
    expect(closedPeriod.auditTrail[0].event).toBe('PERIOD_OPENED');
    expect(closedPeriod.auditTrail[1].event).toBe('PERIOD_CLOSED');
  });

  test('P0-D02 — clôture période CLOSED refusée', () => {
    const period = validClosedPeriod();

    expect(() =>
      AccountingGuardian.closePeriod(period, 'admin', '2026-01-31T23:59:59Z')
    ).toThrow('Only OPEN periods can be closed');
  });

  test('P0-D03 — clôture période LOCKED refusée', () => {
    const period = validLockedPeriod();

    expect(() =>
      AccountingGuardian.closePeriod(period, 'admin', '2026-01-31T23:59:59Z')
    ).toThrow('Only OPEN periods can be closed');
  });

  /* =========================
     E. Tests d'intégration
     ========================= */

  test('P0-E01 — validation complète réussie', () => {
    const period = validOpenPeriod();
    const entry = validEntry();

    expect(() =>
      AccountingGuardian.validateNewEntry(period, entry)
    ).not.toThrow();
  });

  test('P0-E02 — violation multiple détectée', () => {
    const period = validClosedPeriod(); // Déjà une violation
    const entry = validSingleLineEntry(); // Une autre violation

    expect(() =>
      AccountingGuardian.validateNewEntry(period, entry)
    ).toThrow(GuardianViolation);
  });

});
