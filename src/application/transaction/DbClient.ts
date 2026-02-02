// ==================================================================================
// SPOFE — DbClient.ts
// Interface minimaliste : abstraction pour accès base de données
// ==================================================================================
// Responsabilité : Opérations APPEND-ONLY (INSERT uniquement)
// Gère les transactions (BEGIN/COMMIT/ROLLBACK)
// ==================================================================================

/**
 * Format normalisé d'une décision pour insertion DB
 */
export interface DecisionData {
  decision_id: string;
  process_name: string;
  actor_role: 'SYSTEM' | 'ADMIN' | 'USER';
  decision_type: 'CREATE' | 'UPDATE' | 'CLOSE' | 'TRANSFER';
  payload: unknown;
  // created_at ajouté automatiquement par la DB (DEFAULT now())
}

/**
 * Format normalisé d'un événement pour insertion DB
 */
export interface EventData {
  event_id: string;
  decision_id: string;
  event_type: 'CREATED' | 'UPDATED' | 'CLOSED' | 'TRANSFERRED';
  payload: unknown;
  // occurred_at ajouté automatiquement par la DB (DEFAULT now())
}

/**
 * Format normalisé d'un fait pour insertion DB
 */
export interface FactData {
  fact_id: string;
  aggregate_id: string;
  fact_type: 'SNAPSHOT'; // Extensible
  payload: unknown;
  caused_by_event: string; // UUID d'un event
  // valid_from ajouté automatiquement par la DB (DEFAULT now())
}

/**
 * Format normalisé d'une entrée d'audit
 */
export interface AuditData {
  audit_id: string;
  decision_id: string;
  invariant_version: string;   // ex: "2.1.0"
  checksum: string;            // HMAC-SHA256
  // created_at ajouté automatiquement par la DB (DEFAULT now())
}

/**
 * Port DbClient
 * 
 * Implémentation : PostgreSQL Native Client ou Query Builder
 * Responsabilité : Opérations APPEND-ONLY + Gestion des transactions
 * 
 * Invariants :
 *   ✓ INSERT uniquement (pas de UPDATE/DELETE)
 *   ✓ Transactions ACID
 *   ✓ FK enforced (decision→process, event→decision, fact→event, audit→decision)
 *   ✓ Pas d'ORM requis (SQL direct possible)
 */
export interface DbClient {
  // ─────────────────────────────────────────────
  // Transaction Control
  // ─────────────────────────────────────────────
  
  /**
   * Commence une transaction
   * 
   * @throws Si la transaction est déjà active
   */
  begin(): Promise<void>;
  
  /**
   * Valide la transaction
   * 
   * Exécute COMMIT et rend les changements permanents
   * 
   * @throws Si aucune transaction active
   */
  commit(): Promise<void>;
  
  /**
   * Annule la transaction
   * 
   * Exécute ROLLBACK et défait tous les changements
   * 
   * @throws Si aucune transaction active
   */
  rollback(): Promise<void>;

  // ─────────────────────────────────────────────
  // Append-Only Writes (insert uniquement)
  // ─────────────────────────────────────────────
  
  /**
   * Insère une décision dans la table decision
   * 
   * @param data Décision à insérer
   * @throws Si FK process_name invalide
   * @throws Si INSERT échoue (contraint d'intégrité)
   */
  insertDecision(data: DecisionData): Promise<void>;
  
  /**
   * Insère plusieurs événements dans la table event
   * 
   * Batch insert pour performance (peut être atomique ou séquentiel)
   * 
   * @param events Événements à insérer
   * @throws Si FK decision_id invalide
   * @throws Si un événement échoue
   */
  insertEvents(events: EventData[]): Promise<void>;
  
  /**
   * Insère plusieurs faits dans la table fact
   * 
   * Batch insert pour performance
   * 
   * @param facts Faits à insérer
   * @throws Si FK caused_by_event invalide
   * @throws Si un fait échoue
   */
  insertFacts(facts: FactData[]): Promise<void>;
  
  /**
   * Insère une entrée d'audit dans la table audit_log
   * 
   * Appelé APRÈS decision/events/facts pour garantir l'ordre
   * 
   * @param data Entrée d'audit
   * @throws Si FK decision_id invalide
   */
  insertAudit(data: AuditData): Promise<void>;
}

// ==================================================================================
// Type Guards & Utilities
// ==================================================================================

/**
 * Valide le format d'une DecisionData
 */
export function isValidDecisionData(data: unknown): data is DecisionData {
  const d = data as any;
  return (
    typeof d?.decision_id === 'string' &&
    typeof d?.process_name === 'string' &&
    ['SYSTEM', 'ADMIN', 'USER'].includes(d?.actor_role) &&
    ['CREATE', 'UPDATE', 'CLOSE', 'TRANSFER'].includes(d?.decision_type) &&
    d?.payload !== undefined
  );
}

/**
 * Valide le format d'une EventData
 */
export function isValidEventData(data: unknown): data is EventData {
  const d = data as any;
  return (
    typeof d?.event_id === 'string' &&
    typeof d?.decision_id === 'string' &&
    ['CREATED', 'UPDATED', 'CLOSED', 'TRANSFERRED'].includes(d?.event_type) &&
    d?.payload !== undefined
  );
}

/**
 * Valide le format d'une FactData
 */
export function isValidFactData(data: unknown): data is FactData {
  const d = data as any;
  return (
    typeof d?.fact_id === 'string' &&
    typeof d?.aggregate_id === 'string' &&
    d?.fact_type === 'SNAPSHOT' &&
    d?.payload !== undefined &&
    typeof d?.caused_by_event === 'string'
  );
}

/**
 * Valide le format d'une AuditData
 */
export function isValidAuditData(data: unknown): data is AuditData {
  const d = data as any;
  return (
    typeof d?.audit_id === 'string' &&
    typeof d?.decision_id === 'string' &&
    typeof d?.invariant_version === 'string' &&
    typeof d?.checksum === 'string'
  );
}
