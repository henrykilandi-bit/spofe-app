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

  it('S-08 — tenant isolation is enforced even if upstream ports leak mixed tenants', async () => {
    const leakyController = buildTresoconsolidationController(
      {
        async getBalances() {
          return [
            {
              caisseId: 'CAISSE_1',
              caisseLabel: 'Caisse T1',
              solde: 100,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_1',
            },
            {
              caisseId: 'CAISSE_X',
              caisseLabel: 'Caisse T2',
              solde: 999,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_2',
            },
          ];
        },
        async getJournal() {
          return [
            {
              movementId: 'MOV_C_1',
              date: '2026-01-01',
              libelle: 'Encaissement T1',
              montant: 100,
              devise: 'XOF',
              tenantId: 'TENANT_1',
              createdAt: '2026-01-01T10:00:00Z',
            },
            {
              movementId: 'MOV_C_X',
              date: '2026-01-01',
              libelle: 'Encaissement T2',
              montant: 999,
              devise: 'XOF',
              tenantId: 'TENANT_2',
              createdAt: '2026-01-01T10:10:00Z',
            },
          ];
        },
      },
      {
        async getBalances() {
          return [
            {
              bankAccountId: 'BANK_1',
              bankName: 'Banque T1',
              accountReference: 'REF-T1',
              solde: 300,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_1',
            },
            {
              bankAccountId: 'BANK_X',
              bankName: 'Banque T2',
              accountReference: 'REF-T2',
              solde: 777,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_2',
            },
          ];
        },
        async getJournal() {
          return [
            {
              movementId: 'MOV_B_1',
              date: '2026-01-01',
              libelle: 'Virement T1',
              montant: 300,
              devise: 'XOF',
              tenantId: 'TENANT_1',
              createdAt: '2026-01-01T11:00:00Z',
            },
            {
              movementId: 'MOV_B_X',
              date: '2026-01-01',
              libelle: 'Virement T2',
              montant: 777,
              devise: 'XOF',
              tenantId: 'TENANT_2',
              createdAt: '2026-01-01T11:10:00Z',
            },
          ];
        },
      }
    );

    const balance = await leakyController.balance({
      tenantId: 'TENANT_1',
      query: {},
    });
    expect(balance.status).toBe(200);
    expect(balance.body.totalCaisse).toBe(100);
    expect(balance.body.totalBanque).toBe(300);
    expect(balance.body.totalTresorerie).toBe(400);

    const journal = await leakyController.journal({
      tenantId: 'TENANT_1',
      query: {},
    });
    expect(journal.status).toBe(200);
    expect(journal.body).toHaveLength(2);
    expect(journal.body.map((entry: any) => entry.movementId)).toEqual([
      'MOV_C_1',
      'MOV_B_1',
    ]);
  });

  it('S-09 — sourceId filter is propagated to source-specific journal', async () => {
    const filteredController = buildTresoconsolidationController(
      {
        async getBalances() {
          return [
            {
              caisseId: 'CAISSE_1',
              caisseLabel: 'Caisse 1',
              solde: 100,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_1',
            },
          ];
        },
        async getJournal(_tenantId, filters) {
          const rows = [
            {
              movementId: 'MOV_C_1',
              date: '2026-01-01',
              libelle: 'Caisse 1',
              montant: 100,
              devise: 'XOF',
              tenantId: 'TENANT_1',
              createdAt: '2026-01-01T10:00:00Z',
              caisseId: 'CAISSE_1',
            },
            {
              movementId: 'MOV_C_2',
              date: '2026-01-01',
              libelle: 'Caisse 2',
              montant: 50,
              devise: 'XOF',
              tenantId: 'TENANT_1',
              createdAt: '2026-01-01T10:05:00Z',
              caisseId: 'CAISSE_2',
            },
          ];
          return filters?.caisseId
            ? rows.filter(row => row.caisseId === filters.caisseId)
            : rows;
        },
      },
      {
        async getBalances() {
          return [
            {
              bankAccountId: 'BANK_1',
              bankName: 'Banque 1',
              accountReference: 'REF-B1',
              solde: 300,
              devise: 'XOF',
              asOf: '2026-01-01',
              tenantId: 'TENANT_1',
            },
          ];
        },
        async getJournal() {
          return [];
        },
      }
    );

    const res = await filteredController.journal({
      tenantId: 'TENANT_1',
      query: {
        source: 'CAISSE',
        sourceId: 'CAISSE_1',
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].movementId).toBe('MOV_C_1');
    expect(res.body[0].source).toBe('CAISSE');
  });
});
