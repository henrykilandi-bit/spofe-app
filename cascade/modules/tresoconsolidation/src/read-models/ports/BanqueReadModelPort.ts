/**
 * BanqueReadModelPort.ts
 * Port read-model — Source Trésorerie-Banque
 *
 * @module tresoconsolidation
 * @layer read-models/ports
 * @governance SPOFE P0
 * @source tresorerie-banque (certifié BUILD_PROOF)
 */

export interface BanqueBalanceRM {
  bankAccountId: string;
  bankName: string;
  accountReference: string;
  solde: number;
  devise: string;
  asOf: string;
  tenantId: string;
}

export interface BanqueJournalRM {
  movementId: string;
  date: string;
  libelle: string;
  montant: number;
  devise: string;
  referenceExterne?: string;
  tenantId: string;
  createdAt: string;
}

export interface BanqueReadModelPort {
  getBalances(tenantId: string, asOf?: string): Promise<BanqueBalanceRM[]>;
  getJournal(
    tenantId: string,
    filters?: { fromDate?: string; toDate?: string; bankAccountId?: string }
  ): Promise<BanqueJournalRM[]>;
}
