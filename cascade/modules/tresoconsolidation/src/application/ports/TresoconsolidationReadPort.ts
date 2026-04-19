/**
 * TresoconsolidationReadPort.ts
 * Port read-only — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer application/ports
 * @governance SPOFE P0
 *
 * Ce port définit l'interface de lecture pour les read-models consolidés.
 * Aucune écriture autorisée.
 */

export interface TresoconsolidationReadPort {
  /**
   * Retourne le solde consolidé global (caisse + banque)
   */
  getConsolidatedBalance(tenantId: string, asOf?: string): Promise<any>;

  /**
   * Retourne la ventilation des soldes par source (CAISSE | BANQUE)
   */
  getBalanceBySource(tenantId: string, source?: string, asOf?: string): Promise<any[]>;

  /**
   * Retourne les soldes détaillés par caisse physique
   */
  getBalanceByCaisse(tenantId: string, caisseId?: string, asOf?: string): Promise<any[]>;

  /**
   * Retourne les soldes détaillés par compte bancaire
   */
  getBalanceByBankAccount(tenantId: string, bankAccountId?: string, asOf?: string): Promise<any[]>;

  /**
   * Retourne le journal consolidé des mouvements de trésorerie
   */
  getConsolidatedJournal(
    tenantId: string,
    filters?: {
      fromDate?: string;
      toDate?: string;
      source?: 'CAISSE' | 'BANQUE';
      sourceId?: string;
    }
  ): Promise<any[]>;
}
