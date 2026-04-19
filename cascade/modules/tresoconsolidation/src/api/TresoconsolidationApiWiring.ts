/**
 * TresoconsolidationApiWiring.ts
 * Wiring API → Application → Read-Models
 *
 * @module tresoconsolidation
 * @layer api
 * @governance SPOFE P0
 *
 * Point d'assemblage unique du module.
 * Injection des dépendances read-only.
 */

import { TresoconsolidationReadRepository } from '../read-models/TresoconsolidationReadRepository';
import { TresoconsolidationController } from './controllers/TresoconsolidationController';

import { GetConsolidatedBalanceHandler } from '../application/handlers/GetConsolidatedBalanceHandler';
import { GetBalanceBySourceHandler } from '../application/handlers/GetBalanceBySourceHandler';
import { GetBalanceByCaisseHandler } from '../application/handlers/GetBalanceByCaisseHandler';
import { GetBalanceByBankAccountHandler } from '../application/handlers/GetBalanceByBankAccountHandler';
import { GetConsolidatedJournalHandler } from '../application/handlers/GetConsolidatedJournalHandler';

import { CaisseReadModelPort } from '../read-models/ports/CaisseReadModelPort';
import { BanqueReadModelPort } from '../read-models/ports/BanqueReadModelPort';

/**
 * Factory function pour construire le controller complet.
 *
 * @param caisseRM - Port read-model tresorerie-caisse (certifié BUILD_PROOF)
 * @param banqueRM - Port read-model tresorerie-banque (certifié BUILD_PROOF)
 * @returns Controller prêt à être branché sur n'importe quel framework HTTP
 */
export const buildTresoconsolidationController = (
  caisseRM: CaisseReadModelPort,
  banqueRM: BanqueReadModelPort
): TresoconsolidationController => {
  // Assemblage du repository consolidé
  const repo = new TresoconsolidationReadRepository(caisseRM, banqueRM);

  // Construction du controller avec tous les handlers
  return new TresoconsolidationController(
    new GetConsolidatedBalanceHandler(repo),
    new GetBalanceBySourceHandler(repo),
    new GetBalanceByCaisseHandler(repo),
    new GetBalanceByBankAccountHandler(repo),
    new GetConsolidatedJournalHandler(repo)
  );
};
