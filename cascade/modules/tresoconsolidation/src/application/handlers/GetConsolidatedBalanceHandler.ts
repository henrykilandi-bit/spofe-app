/**
 * GetConsolidatedBalanceHandler.ts
 * Query Handler — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/handlers
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-10
 *
 * Retourne le solde consolidé global (caisse + banque).
 * Guardian appelé systématiquement.
 */

import { TresoconsolidationGuardian } from '../../guardian/TresoconsolidationGuardian';
import { TresoconsolidationReadPort } from '../ports/TresoconsolidationReadPort';
import { GetConsolidatedBalanceQuery } from '../queries/GetConsolidatedBalanceQuery';

export class GetConsolidatedBalanceHandler {
  constructor(private readonly readPort: TresoconsolidationReadPort) {}

  async execute(query: GetConsolidatedBalanceQuery): Promise<any> {
    // Guardian P0 — Read-only strict
    TresoconsolidationGuardian.assertReadOnly(true, 'GET');

    return this.readPort.getConsolidatedBalance(
      query.tenantId,
      query.asOf
    );
  }
}
