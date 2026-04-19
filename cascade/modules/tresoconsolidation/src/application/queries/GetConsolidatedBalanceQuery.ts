/**
 * GetConsolidatedBalanceQuery.ts
 * Query DTO — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/queries
 * @governance SPOFE P0
 */

export interface GetConsolidatedBalanceQuery {
  tenantId: string;
  asOf?: string;
}
