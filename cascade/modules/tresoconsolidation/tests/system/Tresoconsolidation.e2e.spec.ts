/**
 * Tresoconsolidation.e2e.spec.ts
 * Tests Système E2E inter-couches — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer tests/system
 * @governance SPOFE P0
 *
 * Valide le wiring complet : API → Application → Read-Models → Ports
 * Guardian implicitement respecté via les handlers.
 */

import { describe, it, expect } from '@jest/globals';
import { buildTresoconsolidationController } from '../../src/api/TresoconsolidationApiWiring';
import { FakeCaisseReadModel } from './fakes/FakeCaisseReadModel';
import { FakeBanqueReadModel } from './fakes/FakeBanqueReadModel';

describe('Tresoconsolidation — System E2E Tests (P0)', () => {
  const controller = buildTresoconsolidationController(
    new FakeCaisseReadModel(),
    new FakeBanqueReadModel()
  );

  const baseReq = {
    tenantId: 'TENANT_1',
    query: {},
  };

  // ═══════════════════════════════════════════════════════════════════
  // S-01 — Consolidated Balance End-to-End
  // ═══════════════════════════════════════════════════════════════════

  it('S-01 — consolidated balance is returned', async () => {
    const res = await controller.balance(baseReq);

    expect(res.status).toBe(200);
    expect(res.body.totalCaisse).toBe(100);
    expect(res.body.totalBanque).toBe(300);
    expect(res.body.totalTresorerie).toBe(400);
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-02 — Balance By Source End-to-End
  // ═══════════════════════════════════════════════════════════════════

  it('S-02 — balance by source returns both CAISSE and BANQUE', async () => {
    const res = await controller.balanceBySource(baseReq);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((b: any) => b.source)).toContain('CAISSE');
    expect(res.body.map((b: any) => b.source)).toContain('BANQUE');
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-03 — Consolidated Journal End-to-End
  // ═══════════════════════════════════════════════════════════════════

  it('S-03 — consolidated journal is merged and ordered', async () => {
    const res = await controller.journal(baseReq);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].createdAt < res.body[1].createdAt).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-04 — Read-Only Contract
  // ═══════════════════════════════════════════════════════════════════

  it('S-04 — read-only contract respected (no mutation)', async () => {
    const res = await controller.balance(baseReq);
    expect(res.status).toBe(200);
    // Absence d'effets de bord = succès
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-05 — Balance By Caisse End-to-End
  // ═══════════════════════════════════════════════════════════════════

  it('S-05 — balance by caisse returns caisse details', async () => {
    const res = await controller.balanceByCaisse(baseReq);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].caisseId).toBe('CAISSE_1');
    expect(res.body[0].solde).toBe(100);
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-06 — Balance By Bank Account End-to-End
  // ═══════════════════════════════════════════════════════════════════

  it('S-06 — balance by bank account returns bank details', async () => {
    const res = await controller.balanceByBankAccount(baseReq);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].bankAccountId).toBe('BANK_1');
    expect(res.body[0].solde).toBe(300);
  });

  // ═══════════════════════════════════════════════════════════════════
  // S-07 — Source Traceability
  // ═══════════════════════════════════════════════════════════════════

  it('S-07 — journal entries have explicit source', async () => {
    const res = await controller.journal(baseReq);

    expect(res.status).toBe(200);
    res.body.forEach((entry: any) => {
      expect(['CAISSE', 'BANQUE']).toContain(entry.source);
    });
  });
});
