/**
 * GetBalanceByCaisseHandler.ts
 * Query Handler — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/handlers
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-10
 *
 * Retourne les soldes détaillés par caisse physique.
 * Guardian appelé systématiquement.
 */

import { TresoconsolidationGuardian } from '../../guardian/TresoconsolidationGuardian';
import { TresoconsolidationReadPort } from '../ports/TresoconsolidationReadPort';
import { GetBalanceByCaisseQuery } from '../queries/GetBalanceByCaisseQuery';

export class GetBalanceByCaisseHandler {
  constructor(private readonly readPort: TresoconsolidationReadPort) {}

  async execute(query: GetBalanceByCaisseQuery): Promise<any[]> {
    // Guardian P0 — Read-only strict
    TresoconsolidationGuardian.assertReadOnly(true, 'GET');

    return this.readPort.getBalanceByCaisse(
      query.tenantId,
      query.caisseId,
      query.asOf
    );
  }
}
