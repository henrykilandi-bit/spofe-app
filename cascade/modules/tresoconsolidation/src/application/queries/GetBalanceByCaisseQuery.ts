/**
 * GetBalanceByCaisseQuery.ts
 * Query DTO — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/queries
 * @governance SPOFE P0
 */

export interface GetBalanceByCaisseQuery {
  tenantId: string;
  caisseId?: string;
  asOf?: string;
}
