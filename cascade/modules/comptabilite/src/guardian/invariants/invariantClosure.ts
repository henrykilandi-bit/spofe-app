/**
 * 🔒 Invariants P0 - Clôture
 * 
 * G-COMPTA-16: La clôture vérifie l'équilibre global de la période
 * G-COMPTA-17: La clôture interdit toute écriture postérieure
 * G-COMPTA-18: La clôture génère une trace d'audit
 */

export class InvariantClosure {
  
  /**
   * G-COMPTA-16: Vérifier l'équilibre global pour la clôture
   */
  static validateGlobalBalance(totalDebit: number, totalCredit: number): boolean {
    return Number.isFinite(totalDebit) && Number.isFinite(totalCredit) && totalDebit === totalCredit;
  }
  
  /**
   * G-COMPTA-17: Vérifier l'interdiction d'écritures post-clôture
   */
  static validateNoPostClosureEntries(periodStatus: string): boolean {
    return periodStatus === 'OPEN';
  }
  
  /**
   * G-COMPTA-18: Vérifier la présence de la trace d'audit de clôture
   */
  static validateAuditTrail(
    auditTrail: Array<{ event: string; at: string; by: string }>
  ): boolean {
    return auditTrail.some(event => event.event === 'PERIOD_CLOSED' && !!event.at && !!event.by);
  }
}
