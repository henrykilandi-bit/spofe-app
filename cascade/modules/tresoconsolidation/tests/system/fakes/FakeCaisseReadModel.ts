/**
 * FakeCaisseReadModel.ts
 * Fake technique — Source Trésorerie-Caisse
 *
 * @module tresoconsolidation
 * @layer tests/system/fakes
 * @governance SPOFE P0
 *
 * Simule un module certifié sans logique métier.
 */

import {
  CaisseReadModelPort,
  CaisseBalanceRM,
  CaisseJournalRM,
} from '../../../src/read-models/ports/CaisseReadModelPort';

export class FakeCaisseReadModel implements CaisseReadModelPort {
  async getBalances(): Promise<CaisseBalanceRM[]> {
    return [
      {
        caisseId: 'CAISSE_1',
        caisseLabel: 'Caisse principale',
        solde: 100,
        devise: 'XOF',
        asOf: '2026-01-01',
        tenantId: 'TENANT_1',
      },
    ];
  }

  async getJournal(): Promise<CaisseJournalRM[]> {
    return [
      {
        movementId: 'MOV_C_1',
        date: '2026-01-01',
        libelle: 'Encaissement',
        montant: 100,
        devise: 'XOF',
        tenantId: 'TENANT_1',
        createdAt: '2026-01-01T10:00:00Z',
      },
    ];
  }
}
