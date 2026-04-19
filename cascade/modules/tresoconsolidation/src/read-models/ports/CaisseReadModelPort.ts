/**
 * CaisseReadModelPort.ts
 * Port read-model — Source Trésorerie-Caisse
 *
 * @module tresoconsolidation
 * @layer read-models/ports
 * @governance SPOFE P0
 * @source tresorerie-caisse (certifié BUILD_PROOF)
 */

export interface CaisseBalanceRM {
  caisseId: string;
  caisseLabel: string;
  solde: number;
  devise: string;
  asOf: string;
  tenantId: string;
}

export interface CaisseJournalRM {
  movementId: string;
  date: string;
  libelle: string;
  montant: number;
  devise: string;
  referenceExterne?: string;
  tenantId: string;
  createdAt: string;
}

export interface CaisseReadModelPort {
  getBalances(tenantId: string, asOf?: string): Promise<CaisseBalanceRM[]>;
  getJournal(
    tenantId: string,
    filters?: { fromDate?: string; toDate?: string; caisseId?: string }
  ): Promise<CaisseJournalRM[]>;
}
