/**
 * TresoconsolidationReadRepository.ts
 * Repository read-only consolidé
 *
 * @module tresoconsolidation
 * @layer read-models
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-02, G-TRESO-03
 *
 * Point d'entrée unique pour toutes les projections consolidées.
 * Aucune écriture, aucune logique métier, sources certifiées uniquement.
 */

import { CaisseReadModelPort } from './ports/CaisseReadModelPort';
import { BanqueReadModelPort } from './ports/BanqueReadModelPort';
import {
  computeConsolidatedBalance,
  ConsolidatedTreasuryBalanceRM,
} from './projections/ConsolidatedTreasuryBalance';
import {
  computeBalanceBySource,
  TreasuryBalanceBySourceRM,
} from './projections/TreasuryBalanceBySource';
import {
  computeBalanceByCaisse,
  TreasuryBalanceByCaisseRM,
} from './projections/TreasuryBalanceByCaisse';
import {
  computeBalanceByBankAccount,
  TreasuryBalanceByBankAccountRM,
} from './projections/TreasuryBalanceByBankAccount';
import {
  computeConsolidatedJournal,
  ConsolidatedTreasuryJournalRM,
} from './projections/ConsolidatedTreasuryJournal';

export class TresoconsolidationReadRepository {
  constructor(
    private readonly caisseRM: CaisseReadModelPort,
    private readonly banqueRM: BanqueReadModelPort
  ) {}

  async getConsolidatedBalance(
    tenantId: string,
    asOf?: string
  ): Promise<ConsolidatedTreasuryBalanceRM> {
    const [caisse, banque] = await Promise.all([
      this.caisseRM.getBalances(tenantId, asOf),
      this.banqueRM.getBalances(tenantId, asOf),
    ]);
    return computeConsolidatedBalance(caisse, banque);
  }

  async getBalanceBySource(
    tenantId: string,
    source?: string,
    asOf?: string
  ): Promise<TreasuryBalanceBySourceRM[]> {
    const [caisse, banque] = await Promise.all([
      this.caisseRM.getBalances(tenantId, asOf),
      this.banqueRM.getBalances(tenantId, asOf),
    ]);

    const result = computeBalanceBySource(caisse, banque);

    if (source) {
      return result.filter(r => r.source === source);
    }
    return result;
  }

  async getBalanceByCaisse(
    tenantId: string,
    caisseId?: string,
    asOf?: string
  ): Promise<TreasuryBalanceByCaisseRM[]> {
    const caisse = await this.caisseRM.getBalances(tenantId, asOf);
    return computeBalanceByCaisse(
      caisseId ? caisse.filter(c => c.caisseId === caisseId) : caisse
    );
  }

  async getBalanceByBankAccount(
    tenantId: string,
    bankAccountId?: string,
    asOf?: string
  ): Promise<TreasuryBalanceByBankAccountRM[]> {
    const banque = await this.banqueRM.getBalances(tenantId, asOf);
    return computeBalanceByBankAccount(
      bankAccountId
        ? banque.filter(b => b.bankAccountId === bankAccountId)
        : banque
    );
  }

  async getConsolidatedJournal(
    tenantId: string,
    filters?: {
      fromDate?: string;
      toDate?: string;
      source?: 'CAISSE' | 'BANQUE';
      sourceId?: string;
    }
  ): Promise<ConsolidatedTreasuryJournalRM[]> {
    const [caisse, banque] = await Promise.all([
      this.caisseRM.getJournal(tenantId, filters),
      this.banqueRM.getJournal(tenantId, filters),
    ]);

    return computeConsolidatedJournal(
      filters?.source === 'BANQUE' ? [] : caisse,
      filters?.source === 'CAISSE' ? [] : banque
    );
  }
}
