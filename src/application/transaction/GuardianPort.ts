// ==================================================================================
// SPOFE — GuardianPort.ts
// Interface normative : contrat entre TransactionManager et Guardian v4
// ==================================================================================
// Responsabilité : Valider une décision selon les invariants SILC v2.1
// Appelé AVANT la transaction DB (pre-validation)
// ==================================================================================

/**
 * Verdict de Guardian v4 après validation d'une décision
 * 
 * @property ok - La décision respecte tous les invariants
 * @property violationCode - Code SILC de la violation si !ok
 * @property invariantVersion - Version des invariants appliqués (ex: "2.1.0")
 * @property checksum - Signature HMAC pour audit trail
 */
export interface GuardianVerdict {
  ok: boolean;
  violationCode?: string;      // ex: "I-USER-01", "I-RBAC-03"
  invariantVersion?: string;   // ex: "2.1.0"
  checksum?: string;           // HMAC-SHA256 ou signature équivalente
}

/**
 * Input normalisé pour Guardian.validateDecision()
 * 
 * Tous les paramètres doivent être fournis pour une validation complète
 */
export interface GuardianValidationInput {
  // Contexte du processus
  processName: string;
  decisionType: string;        // 'CREATE' | 'UPDATE' | 'CLOSE' | 'TRANSFER'
  actorRole: string;           // 'SYSTEM' | 'ADMIN' | 'USER'
  
  // Données métier
  payload: unknown;
  
  // Contexte additionnel (optionnel mais recommandé)
  // ex: { requestId, timestamp, ipAddress, userId }
  context: unknown;
}

/**
 * Port Guardian v4
 * 
 * Implémentation : Guardian v4 dans silc-guardian/
 * Responsabilité : Validation métier pure (aucune I/O autorisée)
 * 
 * Appelé AVANT toute écriture DB
 * Synchrone (pas de promises)
 */
export interface GuardianPort {
  /**
   * Valide une décision avant exécution
   * 
   * @param input Décision à valider
   * @returns Verdict (ok ou violation)
   * 
   * @throws JAMAIS — retourne toujours un verdict
   * 
   * Processus :
   *   1. Vérifier que processName est enregistré
   *   2. Vérifier que actorRole peut effectuer cette decisionType
   *   3. Valider les invariants métier (payload, context, etc.)
   *   4. Générer checksum si ok
   *   5. Retourner verdict
   */
  validateDecision(input: GuardianValidationInput): GuardianVerdict;
}

// ==================================================================================
// Types utilitaires
// ==================================================================================

/**
 * Codes de violation SILC v2.1
 * Utilisés dans GuardianVerdict.violationCode
 */
export const VIOLATION_CODES = {
  // Processus
  PROCESS_UNKNOWN: 'PROCESS_UNKNOWN',           // Process non enregistré
  PROCESS_TRANSITION_INVALID: 'PROCESS_TRANSITION_INVALID', // Transition non autorisée
  INVALID_PROCESS: 'INVALID_PROCESS',           // Process invalide
  
  // Autorité / RBAC
  ACTOR_UNAUTHORIZED: 'ACTOR_UNAUTHORIZED',     // Rôle ne peut pas effectuer cet action
  ROLE_INSUFFICIENT: 'ROLE_INSUFFICIENT',       // Rôle insuffisant
  INVALID_ACTOR: 'INVALID_ACTOR',               // Acteur invalide
  
  // Décisions
  INVALID_DECISION_TYPE: 'INVALID_DECISION_TYPE', // Type de décision invalide
  
  // Données
  PAYLOAD_INVALID: 'PAYLOAD_INVALID',           // Payload ne respecte pas le schéma
  CONTEXT_MISSING: 'CONTEXT_MISSING',           // Context obligatoire manquant
  
  // Invariants
  INVARIANT_VIOLATION: 'INVARIANT_VIOLATION',   // Violation d'invariant business
  REGRESSION_DETECTED: 'REGRESSION_DETECTED',   // Régression détectée
  
  // Autorité implicite
  IMPLICIT_AUTHORITY: 'IMPLICIT_AUTHORITY',     // Autorité implicite non autorisée
  
  // Audit
  AUDIT_REQUIRED: 'AUDIT_REQUIRED',             // Audit obligatoire absent
  
  // Erreur système
  INTERNAL_ERROR: 'INTERNAL_ERROR',             // Erreur interne
  
  // Général
  UNKNOWN: 'UNKNOWN',                           // Violation inconnue
} as const;

export type ViolationCode = typeof VIOLATION_CODES[keyof typeof VIOLATION_CODES];

// ==================================================================================
// Example: Stub Guardian pour tests
// ==================================================================================

/**
 * Stub Guardian pour développement/tests
 * 
 * Production : utiliser l'implémentation réelle de Guardian v4
 */
export class StubGuardianPort implements GuardianPort {
  validateDecision(input: GuardianValidationInput): GuardianVerdict {
    // Validation minimale pour tests
    if (!input.processName || !input.decisionType || !input.actorRole) {
      return {
        ok: false,
        violationCode: VIOLATION_CODES.PAYLOAD_INVALID,
      };
    }
    
    // Stub : toujours OK avec signature
    return {
      ok: true,
      invariantVersion: '2.1.0',
      checksum: 'stub_checksum_abc123', // En production: HMAC-SHA256
    };
  }
}
