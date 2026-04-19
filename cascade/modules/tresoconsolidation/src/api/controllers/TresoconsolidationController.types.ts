/**
 * TresoconsolidationController.types.ts
 * DTO API — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer api/controllers
 * @governance SPOFE P0
 *
 * Types des requêtes API read-only.
 */

export interface BalanceQuery {
  asOf?: string;
}

export interface BalanceBySourceQuery extends BalanceQuery {
  source?: 'CAISSE' | 'BANQUE';
}

export interface BalanceByCaisseQuery extends BalanceQuery {
  caisseId?: string;
}

export interface BalanceByBankAccountQuery extends BalanceQuery {
  bankAccountId?: string;
}

export interface JournalQuery {
  fromDate?: string;
  toDate?: string;
  source?: 'CAISSE' | 'BANQUE';
  sourceId?: string;
}
