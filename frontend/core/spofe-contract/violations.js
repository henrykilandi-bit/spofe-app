/**
 * Violations du contrat
 * 
 * Erreurs spécifiques levées quand le frontend tente de violer le contrat
 */

/**
 * Exception levée quand une violation du contrat est détectée
 * 
 * @example
 *   throw new ContractViolation(
 *     VIOLATIONS.COMMAND_NOT_ALLOWED,
 *     `Command 'HACK_SYSTEM' is not allowed`
 *   );
 */
export class ContractViolation extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ContractViolation';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Codes de violation standardisés et testables
 */
export const VIOLATIONS = {
  // Commands
  COMMAND_NOT_ALLOWED: 'COMMAND_NOT_ALLOWED',
  COMMAND_NOT_DECLARED: 'COMMAND_NOT_DECLARED',
  INVALID_COMMAND_PAYLOAD: 'INVALID_COMMAND_PAYLOAD',
  
  // Read-models
  READ_MODEL_NOT_ALLOWED: 'READ_MODEL_NOT_ALLOWED',
  READ_MODEL_NOT_FOUND: 'READ_MODEL_NOT_FOUND',
  
  // HTTP
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  INVALID_HTTP_METHOD: 'INVALID_HTTP_METHOD',
  
  // Contrat
  CONTRACT_NOT_LOADED: 'CONTRACT_NOT_LOADED',
  CONTRACT_INVALID: 'CONTRACT_INVALID',
  CONTRACT_VERSION_MISMATCH: 'CONTRACT_VERSION_MISMATCH',
  
  // Auth
  MISSING_AUTHORIZATION: 'MISSING_AUTHORIZATION',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // General
  UNKNOWN_VIOLATION: 'UNKNOWN_VIOLATION'
};

/**
 * Messages d'erreur standardisés
 */
export const VIOLATION_MESSAGES = {
  [VIOLATIONS.COMMAND_NOT_ALLOWED]: (command, version) =>
    `Command '${command}' is not allowed by SPOFE contract v${version}. ` +
    `Check allowed-commands.v1.json for authorized commands.`,
    
  [VIOLATIONS.READ_MODEL_NOT_ALLOWED]: (path, version) =>
    `Read-model '${path}' is not allowed by SPOFE contract v${version}. ` +
    `Check allowed-read-models.v1.json for authorized endpoints.`,
    
  [VIOLATIONS.METHOD_NOT_ALLOWED]: (method, endpoint) =>
    `Method '${method}' is not allowed for '${endpoint}'. ` +
    `Only GET (for read-models) and POST/PATCH (for commands) are permitted.`,
    
  [VIOLATIONS.CONTRACT_NOT_LOADED]: () =>
    `SPOFE contract not loaded. Call loadContract() before making any API calls.`,
    
  [VIOLATIONS.MISSING_AUTHORIZATION]: () =>
    `Missing authorization header. Cannot communicate with SPOFE backend.`
};

/**
 * Log une violation avec contexte
 * Utile pour audit trail et debugging
 * 
 * @param {ContractViolation} violation
 * @param {Object} context - Contexte additionnel
 */
export function logViolation(violation, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    violation: violation.toJSON(),
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Log en console
  console.error('[SPOFE VIOLATION]', logEntry);

  // Envoyer au backend pour audit (optionnel)
  if (window.SPOFE_CONFIG?.auditTrailEnabled) {
    fetch('/api/audit/contract-violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(err => console.error('[SPOFE] Failed to log violation', err));
  }
}

/**
 * Classe utilitaire pour gérer les violations en tests
 */
export class ViolationAssertion {
  static isCommandViolation(error) {
    return error.code === VIOLATIONS.COMMAND_NOT_ALLOWED;
  }

  static isReadModelViolation(error) {
    return error.code === VIOLATIONS.READ_MODEL_NOT_ALLOWED;
  }

  static isMethodViolation(error) {
    return error.code === VIOLATIONS.METHOD_NOT_ALLOWED;
  }

  static isContractViolation(error) {
    return error instanceof ContractViolation;
  }
}
