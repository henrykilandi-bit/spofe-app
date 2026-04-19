/**
 * GetBalanceBySourceQuery.ts
 * Query DTO — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/queries
 * @governance SPOFE P0
 */

export interface GetBalanceBySourceQuery {
  tenantId: string;
  source?: string;
  asOf?: string;
}
