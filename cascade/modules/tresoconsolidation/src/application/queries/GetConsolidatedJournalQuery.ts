/**
 * GetConsolidatedJournalQuery.ts
 * Query DTO — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/queries
 * @governance SPOFE P0
 */

export interface GetConsolidatedJournalQuery {
  tenantId: string;
  fromDate?: string;
  toDate?: string;
  source?: 'CAISSE' | 'BANQUE';
  sourceId?: string;
}
