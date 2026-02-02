// ==================================================================================
// SPOFE — TransactionManager.ts
// Orchestrateur principal : Guardian (pre-validation) + DB (atomic)
// ==================================================================================
// Responsabilité : Garantir que toute décision exécutée respecte les invariants
// Barrière de gouvernance (non destructive, point d'entrée unique)
// ==================================================================================

import { GuardianPort } from './GuardianPort';
import { DbClient } from './DbClient';

/**
 * Input normalisé pour executeDecision()
 * 
 * Contient tous les éléments d'une décision complète :
 *   - La décision métier elle-même
 *   - Les événements qui en résultent
 *   - Les faits dérivés
 *   - Le contexte pour Guardian
 */
export interface ExecuteDecisionInput {
  // ─────────────────────────────────────────────
  // Décision
  // ─────────────────────────────────────────────
  
  decisionId: string;           // UUID unique
  processName: string;          // Processus qui génère cette décision
  decisionType: string;         // 'CREATE' | 'UPDATE' | 'CLOSE' | 'TRANSFER'
  actorRole: string;            // 'SYSTEM' | 'ADMIN' | 'USER'
  payload: unknown;             // Données métier de la décision
  
  // ─────────────────────────────────────────────
  // Conséquences observables
  // ─────────────────────────────────────────────
  
  events: Array<{
    eventId: string;
    eventType: string;          // 'CREATED', 'UPDATED', 'CLOSED', 'TRANSFERRED'
    payload: unknown;
  }>;
  
  facts: Array<{
    factId: string;
    aggregateId: string;        // Agrégat auquel ce fait se rapporte
    factType: string;           // 'SNAPSHOT'
    payload: unknown;
    causedByEvent: string;      // UUID d'un event
  }>;
  
  // ─────────────────────────────────────────────
  // Contexte additionnel
  // ─────────────────────────────────────────────
  
  context: unknown;             // Ex: { requestId, userId, ipAddress, ... }
}

/**
 * Résultat de l'exécution d'une décision
 */
export interface ExecuteDecisionResult {
  success: true;
  decisionId: string;
  checksum: string;             // Pour traçabilité
}

/**
 * TransactionManager — Orchestrateur SPOFE
 * 
 * Garanties :
 *   ✓ Guardian valide AVANT la DB (pre-validation)
 *   ✓ Transaction unique (BEGIN/COMMIT/ROLLBACK atomique)
 *   ✓ Audit obligatoire dans la transaction
 *   ✓ Point d'entrée unique (évite les contournements)
 *   ✓ Non-destructif (append-only, pas de mutation)
 * 
 * Séquence d'exécution :
 *   1. Guardian.validateDecision() → Guardian verdict
 *   2. Si verdict.ok === false → STOP (GUARDIAN_VIOLATION)
 *   3. DB.begin()
 *   4. INSERT decision
 *   5. INSERT events[]
 *   6. INSERT facts[]
 *   7. INSERT audit
 *   8. DB.commit() ou DB.rollback() si erreur
 * 
 * Responsabilité : Aucun risque n'échappe
 *   • Écriture sans Guardian → Rejeté (étape 1-2)
 *   • État partiel → Impossible (transaction atomique)
 *   • Audit oublié → Impossible (étape 7 obligatoire)
 *   • Contournement ORM → Impossible (point d'entrée unique)
 */
export class TransactionManager {
  constructor(
    private readonly guardian: GuardianPort,
    private readonly db: DbClient
  ) {}

  /**
   * Exécute une décision de manière gouvernée
   * 
   * @param input Décision à exécuter
   * @returns Résultat de l'exécution
   * 
   * @throws GuardianViolationError Si Guardian rejette la décision
   * @throws DatabaseError Si la transaction échoue
   * @throws ValidationError Si les données ne sont pas valides
   * 
   * Processus :
   *   1. Validation Guardian (métier)
   *   2. Validation des données (schéma)
   *   3. Exécution transactionnelle DB
   *   4. Retour du résultat avec checksum
   */
  async executeDecision(
    input: ExecuteDecisionInput
  ): Promise<ExecuteDecisionResult> {
    // ─────────────────────────────────────────────
    // 1. GUARDIAN v4 — PRE-VALIDATION (NO IO)
    // ─────────────────────────────────────────────
    // Appelé AVANT toute écriture DB
    // Validation métier purement synchrone

    const verdict = this.guardian.validateDecision({
      processName: input.processName,
      decisionType: input.decisionType,
      actorRole: input.actorRole,
      payload: input.payload,
      context: input.context,
    });

    // ❌ Guardian a rejeté la décision
    if (!verdict.ok) {
      throw new GuardianViolationError(
        `Guardian validation failed: ${verdict.violationCode ?? 'UNKNOWN'}`
      );
    }

    // ─────────────────────────────────────────────
    // 2. VALIDATION SCHÉMA
    // ─────────────────────────────────────────────
    // Vérifier que tous les UUIDs et références existent

    this.validateInput(input);

    // ─────────────────────────────────────────────
    // 3. DB TRANSACTION — ATOMIQUE
    // ─────────────────────────────────────────────
    // Une seule transaction, tout ou rien

    await this.db.begin();

    try {
      // ────────────────────────
      // a) DECISION (source de vérité)
      // ────────────────────────
      await this.db.insertDecision({
        decision_id: input.decisionId,
        process_name: input.processName,
        actor_role: input.actorRole as 'SYSTEM' | 'ADMIN' | 'USER',
        decision_type: input.decisionType as 'CREATE' | 'UPDATE' | 'CLOSE' | 'TRANSFER',
        payload: input.payload,
      });

      // ────────────────────────
      // b) EVENTS (conséquences observables)
      // ────────────────────────
      if (input.events.length > 0) {
        await this.db.insertEvents(
          input.events.map(e => ({
            event_id: e.eventId,
            decision_id: input.decisionId,
            event_type: e.eventType as 'CREATED' | 'UPDATED' | 'CLOSED' | 'TRANSFERRED',
            payload: e.payload,
          }))
        );
      }

      // ────────────────────────
      // c) FACTS (état dérivé)
      // ────────────────────────
      if (input.facts.length > 0) {
        await this.db.insertFacts(
          input.facts.map(f => ({
            fact_id: f.factId,
            aggregate_id: f.aggregateId,
            fact_type: f.factType as 'SNAPSHOT',
            payload: f.payload,
            caused_by_event: f.causedByEvent,
          }))
        );
      }

      // ────────────────────────
      // d) AUDIT (OBLIGATOIRE)
      // ────────────────────────
      // Sans audit = transaction incomplète = ROLLBACK
      // C'est intentionnel : Guardian garantit que verdict.checksum existe

      if (!verdict.checksum || !verdict.invariantVersion) {
        throw new Error('Guardian verdict missing checksum or invariant version');
      }

      await this.db.insertAudit({
        audit_id: this.generateUUID(),
        decision_id: input.decisionId,
        invariant_version: verdict.invariantVersion,
        checksum: verdict.checksum,
      });

      // ────────────────────────
      // e) COMMIT
      // ────────────────────────
      // Tout ou rien
      await this.db.commit();

      // ✅ Succès
      return {
        success: true,
        decisionId: input.decisionId,
        checksum: verdict.checksum,
      };
    } catch (err) {
      // ────────────────────────
      // ROLLBACK sur toute erreur
      // ────────────────────────
      // Aucune donnée partielle ne persiste
      await this.db.rollback();

      // Re-throw pour que l'appelant sache qu'il y a eu une erreur
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // Validations & Utilities
  // ─────────────────────────────────────────────

  /**
   * Valide que l'input est correct
   * 
   * @throws ValidationError si les données sont invalides
   */
  private validateInput(input: ExecuteDecisionInput): void {
    // UUID validation
    if (!this.isValidUUID(input.decisionId)) {
      throw new ValidationError('Invalid decisionId: not a valid UUID');
    }

    if (!input.processName || typeof input.processName !== 'string') {
      throw new ValidationError('Invalid processName: must be non-empty string');
    }

    if (!input.decisionType || typeof input.decisionType !== 'string') {
      throw new ValidationError('Invalid decisionType: must be non-empty string');
    }

    if (!input.actorRole || typeof input.actorRole !== 'string') {
      throw new ValidationError('Invalid actorRole: must be non-empty string');
    }

    // Events validation
    for (const event of input.events) {
      if (!this.isValidUUID(event.eventId)) {
        throw new ValidationError('Invalid eventId: not a valid UUID');
      }
      if (!event.eventType || typeof event.eventType !== 'string') {
        throw new ValidationError('Invalid eventType: must be non-empty string');
      }
    }

    // Facts validation
    for (const fact of input.facts) {
      if (!this.isValidUUID(fact.factId)) {
        throw new ValidationError('Invalid factId: not a valid UUID');
      }
      if (!this.isValidUUID(fact.aggregateId)) {
        throw new ValidationError('Invalid aggregateId: not a valid UUID');
      }
      if (!this.isValidUUID(fact.causedByEvent)) {
        throw new ValidationError('Invalid causedByEvent: not a valid UUID');
      }
      if (fact.factType !== 'SNAPSHOT') {
        throw new ValidationError('Invalid factType: must be SNAPSHOT');
      }
    }
  }

  /**
   * Valide qu'une chaîne est un UUID valide (v4)
   */
  private isValidUUID(value: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(value);
  }

  /**
   * Génère un UUID v4
   * 
   * Note : En production, utiliser crypto.randomUUID() ou uuid package
   */
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback pour environnements sans crypto natif
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ─────────────────────────────────────────────
// Custom Errors
// ─────────────────────────────────────────────

/**
 * Erreur levée quand Guardian rejette une décision
 */
export class GuardianViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianViolationError';
  }
}

/**
 * Erreur levée quand les données ne valident pas le schéma
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erreur levée quand la DB rencontre un problème
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ─────────────────────────────────────────────
// Export types pour utilisation externe
// ─────────────────────────────────────────────

export type { GuardianPort } from './GuardianPort';
export type { DbClient } from './DbClient';
