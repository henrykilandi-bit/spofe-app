/**
 * TreasuryBalanceByBankAccount.ts
 * Projection — Détail par compte bancaire
 *
 * @module tresoconsolidation
 * @layer read-models/projections
 * @governance SPOFE P0
 * @guardian G-TRESO-02, G-TRESO-05, G-TRESO-07
 *
 * Mapping direct sans transformation, source exclusive : tresorerie-banque.
 */

import { BanqueBalanceRM } from '../ports/BanqueReadModelPort';

export interface TreasuryBalanceByBankAccountRM {
  bankAccountId: string;
  bankName: string;
  accountReference: string;
  solde: number;
  devise: string;
  asOf: string;
}

export const computeBalanceByBankAccount = (
  banque: BanqueBalanceRM[]
): TreasuryBalanceByBankAccountRM[] =>
  banque.map(b => ({
    bankAccountId: b.bankAccountId,
    bankName: b.bankName,
    accountReference: b.accountReference,
    solde: b.solde,
    devise: b.devise,
    asOf: b.asOf,
  }));
