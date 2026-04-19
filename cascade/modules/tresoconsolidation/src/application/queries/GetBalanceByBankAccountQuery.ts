/**
 * GetBalanceByBankAccountQuery.ts
 * Query DTO — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/queries
 * @governance SPOFE P0
 */

export interface GetBalanceByBankAccountQuery {
  tenantId: string;
  bankAccountId?: string;
  asOf?: string;
}
