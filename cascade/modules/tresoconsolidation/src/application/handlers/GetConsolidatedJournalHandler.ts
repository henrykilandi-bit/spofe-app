/**
 * GetConsolidatedJournalHandler.ts
 * Query Handler — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/handlers
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-10
 *
 * Retourne le journal consolidé des mouvements de trésorerie.
 * Guardian appelé systématiquement.
 */

import { TresoconsolidationGuardian } from '../../guardian/TresoconsolidationGuardian';
import { TresoconsolidationReadPort } from '../ports/TresoconsolidationReadPort';
import { GetConsolidatedJournalQuery } from '../queries/GetConsolidatedJournalQuery';

export class GetConsolidatedJournalHandler {
  constructor(private readonly readPort: TresoconsolidationReadPort) {}

  async execute(query: GetConsolidatedJournalQuery): Promise<any[]> {
    // Guardian P0 — Read-only strict
    TresoconsolidationGuardian.assertReadOnly(true, 'GET');

    return this.readPort.getConsolidatedJournal(query.tenantId, {
      fromDate: query.fromDate,
      toDate: query.toDate,
      source: query.source,
      sourceId: query.sourceId,
    });
  }
}
