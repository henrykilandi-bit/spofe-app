// ==================================================================================
// SPOFE — PostgresDbClient.ts
// Implémentation concrète du DbClient pour PostgreSQL
// ==================================================================================
// Responsabilité : Exécuter les opérations APPEND-ONLY dans une transaction
// Aucun UPDATE/DELETE possible (rejeté par la DB)
// ==================================================================================

import { Pool, PoolClient, QueryResult } from 'pg';
import {
  DbClient,
  DecisionData,
  EventData,
  FactData,
  AuditData,
} from '../../application/transaction/DbClient';

/**
 * Implémentation PostgreSQL du DbClient
 * 
 * Invariants :
 *   ✓ Une seule transaction active à la fois
 *   ✓ Pas de transaction implicite
 *   ✓ INSERT uniquement (append-only)
 *   ✓ Erreur = rollback immédiat
 *   ✓ Pas de retry automatique
 * 
 * Architecture :
 *   - Un client par transaction (PoolClient)
 *   - Isolé du pool pendant la transaction
 *   - Libéré au commit/rollback
 */
export class PostgresDbClient implements DbClient {
  // Client actuel (null = pas de transaction)
  private client: PoolClient | null = null;

  constructor(private readonly pool: Pool) {}

  // ─────────────────────────────────────────────
  // TRANSACTION CONTROL
  // ─────────────────────────────────────────────

  /**
   * Commence une transaction
   * 
   * @throws Si une transaction est déjà active
   */
  async begin(): Promise<void> {
    // Guard: une seule transaction à la fois
    if (this.client) {
      throw new Error(
        'TRANSACTION_ALREADY_STARTED: Cannot start a new transaction while one is active'
      );
    }

    try {
      // 1. Acquérir un client du pool
      this.client = await this.pool.connect();

      // 2. Commencer la transaction
      await this.client.query('BEGIN');
    } catch (err) {
      // Cleanup si l'acquisition ou le BEGIN échoue
      if (this.client) {
        this.client.release();
        this.client = null;
      }
      throw err;
    }
  }

  /**
   * Valide la transaction
   * 
   * Exécute COMMIT et rend tous les changements permanents
   * 
   * @throws Si aucune transaction n'est active
   */
  async commit(): Promise<void> {
    this.ensureTransaction();

    try {
      // 1. Exécuter COMMIT
      await this.client!.query('COMMIT');
    } finally {
      // 2. Toujours libérer le client (même en cas d'erreur)
      this.client!.release();
      this.client = null;
    }
  }

  /**
   * Annule la transaction
   * 
   * Exécute ROLLBACK et défait tous les changements
   * Peut être appelé même si aucune transaction n'est active (idempotent)
   * 
   * @throws Si le ROLLBACK échoue (erreur de connection)
   */
  async rollback(): Promise<void> {
    if (!this.client) {
      // Pas de transaction active = rien à faire
      return;
    }

    try {
      // 1. Exécuter ROLLBACK (même en cas d'erreur précédente)
      await this.client.query('ROLLBACK');
    } finally {
      // 2. Toujours libérer le client
      this.client.release();
      this.client = null;
    }
  }

  // ─────────────────────────────────────────────
  // INSERT OPERATIONS (WRITE-MODEL ONLY)
  // ─────────────────────────────────────────────
  // Append-only : INSERT uniquement
  // Les UPDATEs sont rejetés par PostgreSQL (triggers + permissions)

  /**
   * Insère une décision (source de vérité)
   * 
   * @param data Décision avec tous les champs obligatoires
   * @throws Si FK process_name invalide
   * @throws Si aucune transaction active
   */
  async insertDecision(data: DecisionData): Promise<void> {
    this.ensureTransaction();

    const query = `
      INSERT INTO decision (
        decision_id,
        process_name,
        actor_role,
        decision_type,
        payload,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, now())
      ON CONFLICT DO NOTHING
    `;

    await this.client!.query(query, [
      data.decision_id,
      data.process_name,
      data.actor_role,
      data.decision_type,
      JSON.stringify(data.payload),
    ]);
  }

  /**
   * Insère plusieurs événements
   * 
   * Batch insert pour performance (par défaut: séquentiel pour simplifier)
   * 
   * @param events Événements à insérer
   * @throws Si FK decision_id invalide
   * @throws Si aucune transaction active
   */
  async insertEvents(events: EventData[]): Promise<void> {
    this.ensureTransaction();

    if (events.length === 0) {
      return; // Rien à faire
    }

    // Insertion séquentielle (garantit l'ordre et facilite la gestion d'erreur)
    for (const event of events) {
      const query = `
        INSERT INTO event (
          event_id,
          decision_id,
          event_type,
          payload,
          occurred_at
        ) VALUES ($1, $2, $3, $4, now())
      `;

      await this.client!.query(query, [
        event.event_id,
        event.decision_id,
        event.event_type,
        JSON.stringify(event.payload),
      ]);
    }
  }

  /**
   * Insère plusieurs faits
   * 
   * @param facts Faits à insérer
   * @throws Si FK caused_by_event invalide
   * @throws Si aucune transaction active
   */
  async insertFacts(facts: FactData[]): Promise<void> {
    this.ensureTransaction();

    if (facts.length === 0) {
      return; // Rien à faire
    }

    // Insertion séquentielle
    for (const fact of facts) {
      const query = `
        INSERT INTO fact (
          fact_id,
          aggregate_id,
          fact_type,
          payload,
          caused_by_event,
          valid_from
        ) VALUES ($1, $2, $3, $4, $5, now())
      `;

      await this.client!.query(query, [
        fact.fact_id,
        fact.aggregate_id,
        fact.fact_type,
        JSON.stringify(fact.payload),
        fact.caused_by_event,
      ]);
    }
  }

  /**
   * Insère une entrée d'audit
   * 
   * Appelé EN DERNIER dans la transaction
   * Si cet INSERT échoue, toute la transaction est rollback
   * 
   * @param data Entrée d'audit avec checksum de Guardian
   * @throws Si FK decision_id invalide
   * @throws Si aucune transaction active
   */
  async insertAudit(data: AuditData): Promise<void> {
    this.ensureTransaction();

    const query = `
      INSERT INTO audit_log (
        audit_id,
        decision_id,
        invariant_version,
        checksum,
        created_at
      ) VALUES ($1, $2, $3, $4, now())
    `;

    await this.client!.query(query, [
      data.audit_id,
      data.decision_id,
      data.invariant_version ?? 'UNKNOWN',
      data.checksum ?? 'UNKNOWN',
    ]);
  }

  // ─────────────────────────────────────────────
  // SAFETY & UTILITIES
  // ─────────────────────────────────────────────

  /**
   * Vérifie qu'une transaction est active
   * 
   * @throws Si aucune transaction n'est active
   */
  private ensureTransaction(): void {
    if (!this.client) {
      throw new Error(
        'NO_ACTIVE_TRANSACTION: Must call begin() before insert operations'
      );
    }
  }

  /**
   * Retourne l'état actuel du client
   * Utile pour le debugging/monitoring
   */
  isTransactionActive(): boolean {
    return this.client !== null;
  }

  /**
   * Ferme complètement le pool (shutdown application)
   * 
   * ⚠️ À appeler lors du shutdown de l'application
   * ⚠️ Aucune opération ne peut être effectuée après
   */
  async closePool(): Promise<void> {
    if (this.client) {
      await this.rollback();
    }
    await this.pool.end();
  }
}

// ─────────────────────────────────────────────
// Factory function
// ─────────────────────────────────────────────

/**
 * Crée une instance PostgresDbClient avec un pool
 */
export function createPostgresDbClient(pool: Pool): PostgresDbClient {
  return new PostgresDbClient(pool);
}
