// ==================================================================================
// GuardianPort - Interface du Guardian pour le TransactionManager
// ==================================================================================

/**
 * 🏛️ GUARDIAN PORT INTERFACE
 * 
 * Interface constitutionnelle pour validation Guardian dans SPOFE v2.1.0
 * Abstrait l'implémentation Guardian spécifique pour TransactionManager
 * 
 * Principes constitutionnels:
 * - Tout passage par Guardian DOIT retourner un verdict immutable
 * - Verdict contient version invariants + checksum audit
 * - Violation = code spécifique pour traçabilité
 * - Aucun bypass possible de cette interface
 */

// ==================================================================================
// Types de base
// ==================================================================================

/**
 * Codes de violation standardisés
 * Chaque violation a un code unique pour audit constitutionnel
 */
export enum VIOLATION_CODES {
  // Violations constitutionnelles P0 (bloquantes)
  CONSTITUTION_BROKEN = 'CONSTITUTION_BROKEN',
  INVARIANT_P0_VIOLATED = 'INVARIANT_P0_VIOLATED', 
  MISSING_BUILD_PROOF = 'MISSING_BUILD_PROOF',
  EXPIRED_AUDIT = 'EXPIRED_AUDIT',
  
  // Violations de domaine (métier)
  BUSINESS_RULE_VIOLATED = 'BUSINESS_RULE_VIOLATED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  DATA_INTEGRITY_VIOLATION = 'DATA_INTEGRITY_VIOLATION',
  
  // Violations techniques
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  
  // Violations de processus
  WORKFLOW_VIOLATION = 'WORKFLOW_VIOLATION',
  UNAUTHORIZED_ACTION = 'UNAUTHORIZED_ACTION',
  SEQUENCE_VIOLATION = 'SEQUENCE_VIOLATION',
  
  // Erreurs système
  GUARDIAN_ERROR = 'GUARDIAN_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Verdict Guardian - Résultat immutable de validation
 */
export interface GuardianVerdict {
  /** Décision: true = autorisé, false = refusé */
  readonly ok: boolean;
  
  /** Si refusé: code de violation pour audit */
  readonly violationCode?: VIOLATION_CODES;
  
  /** Si refusé: raison détaillée pour l'utilisateur */
  readonly reason?: string;
  
  /** Si autorisé: version des invariants utilisés */
  readonly invariantVersion?: string;
  
  /** Si autorisé: checksum pour audit trail */
  readonly auditChecksum?: string;
  
  /** Données additionnelles pour contexte */
  readonly metadata?: Record<string, unknown>;
  
  /** Timestamp de la validation */
  readonly timestamp?: Date;
}

/**
 * Input de validation standard
 */
export interface ValidationInput {
  /** Nom du processus métier (ex: 'journal_entry_creation') */
  processName: string;
  
  /** Type de décision (ex: 'CREATE', 'UPDATE', 'DELETE') */
  decisionType: string;
  
  /** Rôle de l'acteur (ex: 'accountant', 'manager') */
  actorRole: string;
  
  /** Données de l'action */
  payload: Record<string, unknown>;
  
  /** Contexte additionnel (environment, user, etc.) */
  context?: Record<string, unknown>;
}

// ==================================================================================
// Interface Guardian Port
// ==================================================================================

/**
 * 🏛️ GUARDIAN PORT
 * 
 * Interface constitutionnelle pour toute validation Guardian
 * Implémentée par les adaptateurs Guardian spécifiques (v4, v5, etc.)
 */
export interface GuardianPort {
  /**
   * 🔐 Valide une décision métier
   * 
   * Méthode principale pour validation constitutionnelle
   * DOIT être appelée pour toute mutation d'état
   * 
   * @param input Décision à valider
   * @returns Verdict immutable (ALLOW/DENY + métadonnées)
   */
  validateDecision(input: ValidationInput): Promise<GuardianVerdict>;
  
  /**
   * 🔐 Valide une mutation (alias pour validateDecision)
   * 
   * Compatibilité avec interface legacy
   * Redirige vers validateDecision
   * 
   * @param input Mutation à valider  
   * @returns Verdict immutable
   */
  validateMutation(input: ValidationInput): Promise<GuardianVerdict>;
}

// ==================================================================================
// Types additionnels pour extensions
// ==================================================================================

/**
 * Contexte d'exécution pour validation
 */
export interface ExecutionContext {
  /** ID utilisateur actuel */
  userId?: string;
  
  /** Rôles utilisateur */
  userRoles?: string[];
  
  /** Environnement (dev/staging/prod) */
  environment?: string;
  
  /** ID de transaction */
  transactionId?: string;
  
  /** Metadata request */
  requestMetadata?: Record<string, unknown>;
}

/**
 * Résultat enrichi avec contexte
 */
export interface EnrichedGuardianVerdict extends GuardianVerdict {
  /** Contexte d'exécution au moment de la validation */
  readonly executionContext?: ExecutionContext;
  
  /** Durée de validation en millisecondes */
  readonly validationDurationMs?: number;
  
  /** Version du Guardian utilisé */
  readonly guardianVersion?: string;
}

// ==================================================================================
// Utilitaires
// ==================================================================================

/**
 * Créateur de verdict "autorisé"
 */
export function createAllowVerdict(
  invariantVersion: string,
  auditChecksum: string,
  metadata?: Record<string, unknown>
): GuardianVerdict {
  return {
    ok: true,
    invariantVersion,
    auditChecksum,
    metadata,
    timestamp: new Date()
  };
}

/**
 * Créateur de verdict "refusé"
 */
export function createDenyVerdict(
  violationCode: VIOLATION_CODES,
  reason: string,
  metadata?: Record<string, unknown>
): GuardianVerdict {
  return {
    ok: false,
    violationCode,
    reason,
    metadata,
    timestamp: new Date()
  };
}

/**
 * Vérifie si un verdict est valide
 */
export function isValidVerdict(verdict: GuardianVerdict): boolean {
  if (verdict.ok) {
    return !!(verdict.invariantVersion && verdict.auditChecksum);
  } else {
    return !!(verdict.violationCode && verdict.reason);
  }
}

// ==================================================================================
// Erreurs spécialisées
// ==================================================================================

/**
 * Erreur de validation Guardian
 */
export class GuardianValidationError extends Error {
  constructor(
    public readonly violationCode: VIOLATION_CODES,
    public readonly reason: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(`Guardian validation failed: ${violationCode} - ${reason}`);
    this.name = 'GuardianValidationError';
  }
}

/**
 * Erreur interne Guardian
 */
export class GuardianInternalError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(`Guardian internal error: ${message}`);
    this.name = 'GuardianInternalError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// ==================================================================================
// Export par défaut
// ==================================================================================

export default GuardianPort;