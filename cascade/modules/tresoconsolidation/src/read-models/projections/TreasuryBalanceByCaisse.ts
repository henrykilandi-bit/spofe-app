/**
 * TreasuryBalanceByCaisse.ts
 * Projection — Détail par caisse physique
 *
 * @module tresoconsolidation
 * @layer read-models/projections
 * @governance SPOFE P0
 * @guardian G-TRESO-02, G-TRESO-05, G-TRESO-07
 *
 * Mapping direct sans transformation, source exclusive : tresorerie-caisse.
 */

import { CaisseBalanceRM } from '../ports/CaisseReadModelPort';

export interface TreasuryBalanceByCaisseRM {
  caisseId: string;
  caisseLabel: string;
  solde: number;
  devise: string;
  asOf: string;
}

export const computeBalanceByCaisse = (
  caisse: CaisseBalanceRM[]
): TreasuryBalanceByCaisseRM[] =>
  caisse.map(c => ({
    caisseId: c.caisseId,
    caisseLabel: c.caisseLabel,
    solde: c.solde,
    devise: c.devise,
    asOf: c.asOf,
  }));
