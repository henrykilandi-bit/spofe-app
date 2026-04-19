/**
 * TresoconsolidationGuardian.spec.ts
 * Tests Guardian P0 — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer guardian
 * @governance SPOFE P0
 * @tests 21
 * @status OBLIGATOIRES
 */

import { describe, it, expect } from '@jest/globals';
import { TresoconsolidationGuardian } from '../../src/guardian/TresoconsolidationGuardian';
import {
  ReadOnlyViolation,
  UnauthorizedSourceViolation,
  WriteLayerAccessViolation,
  TenantIsolationViolation,
  BusinessLogicViolation,
  AccountingLogicViolation,
  UncertifiedSourceViolation,
  InvalidSourceViolation,
  MethodNotAllowedViolation,
} from '../../src/guardian/TresoconsolidationGuardianErrors';
import { ConsolidationContext } from '../../src/guardian/TresoconsolidationGuardian.types';

const certifiedContext = (overrides: Partial<ConsolidationContext> = {}): ConsolidationContext => ({
  tenantId: 'TENANT_1',
  source: 'CAISSE',
  sourceModule: 'tresorerie-caisse',
  isReadOnly: true,
  accessedLayer: 'READ_MODEL',
  certifiedSource: {
    moduleName: 'tresorerie-caisse',
    buildProofHash: 'HASH',
    certified: true,
  },
  ...overrides,
});

describe('TresoconsolidationGuardian — P0 Guardian Tests', () => {
  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-01 — Read-only strict
  // ═══════════════════════════════════════════════════════════════════

  it('G01.1 — reject non read-only access', () => {
    expect(() =>
      TresoconsolidationGuardian.assertReadOnly(false)
    ).toThrow(ReadOnlyViolation);
  });

  it('G01.2 — reject non-GET HTTP method', () => {
    expect(() =>
      TresoconsolidationGuardian.assertReadOnly(true, 'POST')
    ).toThrow(MethodNotAllowedViolation);
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-02 — Sources autorisées uniquement
  // ═══════════════════════════════════════════════════════════════════

  it('G02.1 — allow CAISSE source', () => {
    expect(() =>
      TresoconsolidationGuardian.assertSource('CAISSE')
    ).not.toThrow();
  });

  it('G02.2 — allow BANQUE source', () => {
    expect(() =>
      TresoconsolidationGuardian.assertSource('BANQUE')
    ).not.toThrow();
  });

  it('G02.3 — reject invalid source', () => {
    expect(() =>
      TresoconsolidationGuardian.assertSource('STOCK' as any)
    ).toThrow(InvalidSourceViolation);
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-03 — Interdiction d'accès aux couches write
  // ═══════════════════════════════════════════════════════════════════

  it('G03.1 — reject access to write layer', () => {
    const ctx = certifiedContext({ accessedLayer: 'COMMAND' });
    expect(() =>
      TresoconsolidationGuardian.assertReadLayerOnly(ctx)
    ).toThrow(WriteLayerAccessViolation);
  });

  it('G03.2 — allow read-model access', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.assertReadLayerOnly(ctx)
    ).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-04 — Isolation multi-tenant
  // ═══════════════════════════════════════════════════════════════════

  it('G04.1 — allow same-tenant aggregation', () => {
    expect(() =>
      TresoconsolidationGuardian.assertTenantIsolation('TENANT_1', 'TENANT_1')
    ).not.toThrow();
  });

  it('G04.2 — reject cross-tenant aggregation', () => {
    expect(() =>
      TresoconsolidationGuardian.assertTenantIsolation('TENANT_1', 'TENANT_2')
    ).toThrow(TenantIsolationViolation);
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-05 — Pas de logique métier
  // ═══════════════════════════════════════════════════════════════════

  it('G05.1 — reject business logic detection', () => {
    expect(() =>
      TresoconsolidationGuardian.assertNoBusinessLogic(true)
    ).toThrow(BusinessLogicViolation);
  });

  it('G05.2 — allow absence of business logic', () => {
    expect(() =>
      TresoconsolidationGuardian.assertNoBusinessLogic(false)
    ).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-06 — Pas de logique comptable
  // ═══════════════════════════════════════════════════════════════════

  it('G06.1 — reject accounting logic detection', () => {
    expect(() =>
      TresoconsolidationGuardian.assertNoAccountingLogic(true)
    ).toThrow(AccountingLogicViolation);
  });

  it('G06.2 — allow absence of accounting logic', () => {
    expect(() =>
      TresoconsolidationGuardian.assertNoAccountingLogic(false)
    ).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-07 — Agrégation déterministe
  // ═══════════════════════════════════════════════════════════════════

  it('G07.1 — deterministic validation passes', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.validate(ctx, 'GET')
    ).not.toThrow();
  });

  it('G07.2 — deterministic repeat produces same result', () => {
    const ctx = certifiedContext();
    expect(() => TresoconsolidationGuardian.validate(ctx, 'GET')).not.toThrow();
    expect(() => TresoconsolidationGuardian.validate(ctx, 'GET')).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-08 — Traçabilité de la source
  // ═══════════════════════════════════════════════════════════════════

  it('G08.1 — source field mandatory', () => {
    const ctx = certifiedContext({ source: undefined as any });
    expect(() =>
      TresoconsolidationGuardian.assertSource(ctx.source)
    ).toThrow(InvalidSourceViolation);
  });

  it('G08.2 — valid source accepted', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.assertSource(ctx.source)
    ).not.toThrow();
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-09 — Données certifiées uniquement
  // ═══════════════════════════════════════════════════════════════════

  it('G09.1 — certified source accepted', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.assertAuthorizedModule(ctx)
    ).not.toThrow();
  });

  it('G09.2 — uncertified source rejected', () => {
    const ctx = certifiedContext({
      certifiedSource: { moduleName: 'tresorerie-caisse', buildProofHash: '', certified: false },
    });
    expect(() =>
      TresoconsolidationGuardian.assertAuthorizedModule(ctx)
    ).toThrow(UncertifiedSourceViolation);
  });

  // ═══════════════════════════════════════════════════════════════════
  // G-TRESO-10 — API GET uniquement
  // ═══════════════════════════════════════════════════════════════════

  it('G10.1 — GET allowed', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.validate(ctx, 'GET')
    ).not.toThrow();
  });

  it('G10.2 — PUT rejected', () => {
    const ctx = certifiedContext();
    expect(() =>
      TresoconsolidationGuardian.validate(ctx, 'PUT')
    ).toThrow(MethodNotAllowedViolation);
  });
});
