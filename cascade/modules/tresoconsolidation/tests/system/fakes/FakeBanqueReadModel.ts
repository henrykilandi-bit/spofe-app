/**
 * FakeBanqueReadModel.ts
 * Fake technique — Source Trésorerie-Banque
 *
 * @module tresoconsolidation
 * @layer tests/system/fakes
 * @governance SPOFE P0
 *
 * Simule un module certifié sans logique métier.
 */

import {
  BanqueReadModelPort,
  BanqueBalanceRM,
  BanqueJournalRM,
} from '../../../src/read-models/ports/BanqueReadModelPort';

export class FakeBanqueReadModel implements BanqueReadModelPort {
  async getBalances(): Promise<BanqueBalanceRM[]> {
    return [
      {
        bankAccountId: 'BANK_1',
        bankName: 'Banque Test',
        accountReference: 'REF123',
        solde: 300,
        devise: 'XOF',
        asOf: '2026-01-01',
        tenantId: 'TENANT_1',
      },
    ];
  }

  async getJournal(): Promise<BanqueJournalRM[]> {
    return [
      {
        movementId: 'MOV_B_1',
        date: '2026-01-01',
        libelle: 'Virement',
        montant: 300,
        devise: 'XOF',
        tenantId: 'TENANT_1',
        createdAt: '2026-01-01T11:00:00Z',
      },
    ];
  }
}
