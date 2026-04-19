/**
 * ConsolidatedTreasuryBalance.ts
 * Projection — Solde consolidé global
 *
 * @module tresoconsolidation
 * @layer read-models/projections
 * @governance SPOFE P0
 * @guardian G-TRESO-05, G-TRESO-07
 *
 * Calcul déterministe : somme simple, aucune logique métier.
 */

import { CaisseBalanceRM } from '../ports/CaisseReadModelPort';
import { BanqueBalanceRM } from '../ports/BanqueReadModelPort';

export interface ConsolidatedTreasuryBalanceRM {
  totalCaisse: number;
  totalBanque: number;
  totalTresorerie: number;
  devise: string;
  asOf: string;
}

export const computeConsolidatedBalance = (
  caisse: CaisseBalanceRM[],
  banque: BanqueBalanceRM[]
): ConsolidatedTreasuryBalanceRM => {
  const totalCaisse = caisse.reduce((s, c) => s + c.solde, 0);
  const totalBanque = banque.reduce((s, b) => s + b.solde, 0);

  return {
    totalCaisse,
    totalBanque,
    totalTresorerie: totalCaisse + totalBanque,
    devise: caisse[0]?.devise ?? banque[0]?.devise ?? 'N/A',
    asOf: caisse[0]?.asOf ?? banque[0]?.asOf ?? new Date().toISOString(),
  };
};
