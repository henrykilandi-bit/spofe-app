/**
 * GetBalanceBySourceHandler.ts
 * Query Handler — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/handlers
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-10
 *
 * Retourne la ventilation des soldes par source (CAISSE | BANQUE).
 * Guardian appelé systématiquement.
 */

import { TresoconsolidationGuardian } from '../../guardian/TresoconsolidationGuardian';
import { TresoconsolidationReadPort } from '../ports/TresoconsolidationReadPort';
import { GetBalanceBySourceQuery } from '../queries/GetBalanceBySourceQuery';

export class GetBalanceBySourceHandler {
  constructor(private readonly readPort: TresoconsolidationReadPort) {}

  async execute(query: GetBalanceBySourceQuery): Promise<any[]> {
    // Guardian P0 — Read-only strict
    TresoconsolidationGuardian.assertReadOnly(true, 'GET');

    return this.readPort.getBalanceBySource(
      query.tenantId,
      query.source,
      query.asOf
    );
  }
}
