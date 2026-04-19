/**
 * TreasuryBalanceBySource.ts
 * Projection — Ventilation par source (CAISSE | BANQUE)
 *
 * @module tresoconsolidation
 * @layer read-models/projections
 * @governance SPOFE P0
 * @guardian G-TRESO-05, G-TRESO-07, G-TRESO-08
 *
 * Concaténation déterministe avec marquage source explicite.
 */

import { CaisseBalanceRM } from '../ports/CaisseReadModelPort';
import { BanqueBalanceRM } from '../ports/BanqueReadModelPort';

export interface TreasuryBalanceBySourceRM {
  source: 'CAISSE' | 'BANQUE';
  sourceId: string;
  solde: number;
  devise: string;
  asOf: string;
}

export const computeBalanceBySource = (
  caisse: CaisseBalanceRM[],
  banque: BanqueBalanceRM[]
): TreasuryBalanceBySourceRM[] => [
  ...caisse.map(c => ({
    source: 'CAISSE' as const,
    sourceId: c.caisseId,
    solde: c.solde,
    devise: c.devise,
    asOf: c.asOf,
  })),
  ...banque.map(b => ({
    source: 'BANQUE' as const,
    sourceId: b.bankAccountId,
    solde: b.solde,
    devise: b.devise,
    asOf: b.asOf,
  })),
];
