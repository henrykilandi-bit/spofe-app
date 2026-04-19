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
    const [rawCaisse, rawBanque] = await Promise.all([
      this.caisseRM.getBalances(tenantId, asOf),
      this.banqueRM.getBalances(tenantId, asOf),
    ]);
    const caisse = this.filterByTenant(rawCaisse, tenantId);
    const banque = this.filterByTenant(rawBanque, tenantId);
    return computeConsolidatedBalance(caisse, banque);
  }

  async getBalanceBySource(
    tenantId: string,
    source?: string,
    asOf?: string
  ): Promise<TreasuryBalanceBySourceRM[]> {
    const [rawCaisse, rawBanque] = await Promise.all([
      this.caisseRM.getBalances(tenantId, asOf),
      this.banqueRM.getBalances(tenantId, asOf),
    ]);
    const caisse = this.filterByTenant(rawCaisse, tenantId);
    const banque = this.filterByTenant(rawBanque, tenantId);

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
    const rawCaisse = await this.caisseRM.getBalances(tenantId, asOf);
    const caisse = this.filterByTenant(rawCaisse, tenantId);
    return computeBalanceByCaisse(
      caisseId ? caisse.filter(c => c.caisseId === caisseId) : caisse
    );
  }

  async getBalanceByBankAccount(
    tenantId: string,
    bankAccountId?: string,
    asOf?: string
  ): Promise<TreasuryBalanceByBankAccountRM[]> {
    const rawBanque = await this.banqueRM.getBalances(tenantId, asOf);
    const banque = this.filterByTenant(rawBanque, tenantId);
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
    const caisseFilters = filters?.source === 'BANQUE'
      ? undefined
      : {
          fromDate: filters?.fromDate,
          toDate: filters?.toDate,
          caisseId: filters?.source === 'CAISSE' ? filters?.sourceId : undefined,
        };

    const banqueFilters = filters?.source === 'CAISSE'
      ? undefined
      : {
          fromDate: filters?.fromDate,
          toDate: filters?.toDate,
          bankAccountId: filters?.source === 'BANQUE' ? filters?.sourceId : undefined,
        };

    const [rawCaisse, rawBanque] = await Promise.all([
      this.caisseRM.getJournal(tenantId, caisseFilters),
      this.banqueRM.getJournal(tenantId, banqueFilters),
    ]);
    const caisse = this.filterByTenant(rawCaisse, tenantId);
    const banque = this.filterByTenant(rawBanque, tenantId);

    return computeConsolidatedJournal(
      filters?.source === 'BANQUE' ? [] : caisse,
      filters?.source === 'CAISSE' ? [] : banque
    );
  }

  private filterByTenant<T extends { tenantId: string }>(
    records: readonly T[],
    tenantId: string
  ): T[] {
    return records.filter(record => record.tenantId === tenantId);
  }
}
