/**
 * 🏛️ CONSTITUTIONAL TRANSACTION MANAGER P0
 * TransactionManager constitutionnel - Enregistrement de faits immuables
 * 
 * Principes :
 * - Zéro modification métier, zéro régression fonctionnelle
 * - PostgreSQL devient le juge final de vérité
 * - Plus de save(), update() - Un seul INSERT domain_events
 * - Hash calculé et validé par PostgreSQL uniquement
 * 
 * Flux : Command → Guardian (inchangé) → TransactionManager → INSERT domain_event
 */

import { Pool, PoolClient } from 'pg';
import { Command } from '../commands/Command';
import { Guardian } from '../../guardian/Guardian';

export interface AuditLogEntry {
  commandType: string;
  aggregateId: string;
  timestamp: Date;
  userId?: string;
}

export interface TransactionResult {
  success: boolean;
  eventId?: string;
  sequence?: number;
  timestamp: Date;
}

/**
 * 🏛️ CONSTITUTIONAL TRANSACTION MANAGER P0
 * 
 * Nouvelle responsabilité unique : Enregistrer des faits immuables
 * Plus de logique métier, plus de state management
 * Uniquement INSERT dans domain_events
 */
export class ConstitutionalTransactionManagerP0 {
  constructor(
    private readonly pg: Pool,
    private readonly audit?: (entry: AuditLogEntry) => Promise<void>
  ) {}

  /**
   * 🔐 Exécution d'une commande avec enregistrement immuable
   * 
   * @param command Commande à exécuter
   * @returns Résultat de la transaction
   * 
   * Processus :
   * 1. Guardian validation (inchangée)
   * 2. Transaction DB réelle
   * 3. INSERT immuable dans domain_events
   * 4. Audit minimal (optionnel)
   */
  async execute(command: Command): Promise<TransactionResult> {
    const startTime = new Date();
    
    try {
      // 1. Guardian reste IDENTIQUE - zéro changement
      await command.guardian.validate(command);
      
      // 2. Transaction DB réelle avec client dédié
      const result = await this.executeWithTransaction(async (client) => {
        
        // 3. Écriture IMMUTABLE (ledger) - point d'écriture unique
        const insertResult = await client.query(
          `
          INSERT INTO domain_events (
            aggregate_id,
            aggregate_type,
            event_type,
            payload
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id, sequence, created_at, current_hash
          `,
          [
            command.aggregateId,
            command.aggregateType,
            command.type,
            JSON.stringify(command.payload)
          ]
        );

        const insertedEvent = insertResult.rows[0];
        
        // 4. Audit minimal (optionnel)
        if (this.audit) {
          await this.audit({
            commandType: command.type,
            aggregateId: command.aggregateId,
            timestamp: startTime,
            userId: command.userId
          });
        }

        return {
          eventId: insertedEvent.id,
          sequence: insertedEvent.sequence,
          timestamp: insertedEvent.created_at
        };
      });

      return {
        success: true,
        ...result,
        timestamp: result.timestamp || startTime
      };

    } catch (error) {
      // En cas d'erreur, PostgreSQL garantit que rien n'est écrit
      // grâce à la transaction atomique
      throw new Error(`Constitutional transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * � Exécution avec transaction (helper)
   */
  private async executeWithTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pg.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * �� Exécution multiple de commandes (batch)
   * Garantit l'ordre et l'atomicité du batch
   */
  async executeBatch(commands: Command[]): Promise<TransactionResult[]> {
    if (commands.length === 0) {
      return [];
    }

    const startTime = new Date();
    
    try {
      // Validation de toutes les commandes d'abord
      for (const command of commands) {
        await command.guardian.validate(command);
      }

      // Transaction unique pour tout le batch
      const results = await this.executeWithTransaction(async (client) => {
        const batchResults: TransactionResult[] = [];

        for (const command of commands) {
          const insertResult = await client.query(
            `
            INSERT INTO domain_events (
              aggregate_id,
              aggregate_type,
              event_type,
              payload
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, sequence, created_at, current_hash
            `,
            [
              command.aggregateId,
              command.aggregateType,
              command.type,
              JSON.stringify(command.payload)
            ]
          );

          const insertedEvent = insertResult.rows[0];

          batchResults.push({
            success: true,
            eventId: insertedEvent.id,
            sequence: insertedEvent.sequence,
            timestamp: insertedEvent.created_at
          });

          // Audit pour chaque commande
          if (this.audit) {
            await this.audit({
              commandType: command.type,
              aggregateId: command.aggregateId,
              timestamp: new Date(),
              userId: command.userId
            });
          }
        }

        return batchResults;
      });

      return results;

    } catch (error) {
      throw new Error(`Constitutional batch transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 🔍 Lecture des événements (pour reconstruction d'état)
   * Note : Ceci est utilitaire, le TM n'écrit que des faits
   */
  async getEvents(aggregateId: string, fromSequence?: number): Promise<any[]> {
    const client = await this.pg.connect();
    
    try {
      let query = `
        SELECT 
          id,
          aggregate_id,
          aggregate_type,
          event_type,
          payload,
          sequence,
          created_at,
          current_hash,
          previous_hash
        FROM domain_events
        WHERE aggregate_id = $1
      `;
      
      const params: any[] = [aggregateId];
      
      if (fromSequence) {
        query += ' AND sequence >= $2';
        params.push(fromSequence);
      }
      
      query += ' ORDER BY sequence';
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  /**
   * 📊 Statistiques du ledger (monitoring)
   */
  async getLedgerStats(): Promise<{
    totalEvents: number;
    lastSequence: number;
    lastEventTime: Date;
    chainIntegrity: boolean;
  }> {
    const client = await this.pg.connect();
    
    try {
      // Statistiques de base
      const statsResult = await client.query(`
        SELECT 
          COUNT(*) as total_events,
          MAX(sequence) as last_sequence,
          MAX(created_at) as last_event_time
        FROM domain_events
      `);
      
      const stats = statsResult.rows[0];
      
      // Validation intégrité chaîne
      const integrityResult = await client.query(`
        SELECT check_ledger_integrity() as integrity
      `);
      
      return {
        totalEvents: parseInt(stats.total_events),
        lastSequence: stats.last_sequence || 0,
        lastEventTime: stats.last_event_time || new Date(),
        chainIntegrity: integrityResult.rows[0].integrity
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 🧪 Validation que le point d'écriture est bien constitutionnel
   */
  async validateConstitutionalCompliance(): Promise<{
    isCompliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const client = await this.pg.connect();
    
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      // Vérification 1 : Table domain_events existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'domain_events'
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        issues.push('domain_events table does not exist');
        recommendations.push('Deploy constitutional schema first');
      }
      
      // Vérification 2 : Triggers de défense actifs
      const triggerCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        AND trigger_name IN (
          'no_update_domain_events',
          'no_delete_domain_events',
          'ledger_sequence_lock',
          'verify_chain_on_insert',
          'enforce_hash',
          'verify_sequence'
        )
      `);
      
      const activeTriggers = parseInt(triggerCheck.rows[0].count);
      if (activeTriggers < 6) {
        issues.push(`Only ${activeTriggers}/6 defense triggers active`);
        recommendations.push('Deploy all constitutional defense triggers');
      }
      
      // Vérification 3 : Intégrité chaîne
      const integrityCheck = await client.query(`
        SELECT check_ledger_integrity() as integrity
      `);
      
      if (!integrityCheck.rows[0].integrity) {
        issues.push('Cryptographic chain integrity compromised');
        recommendations.push('Investigate chain integrity violation immediately');
      }
      
      return {
        isCompliant: issues.length === 0,
        issues,
        recommendations
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 🔄 Fermeture propre des connexions
   */
  async close(): Promise<void> {
    await this.pg.end();
  }
}

/**
 * 🏛️ CONSTITUTIONAL AUDIT LOGGER (Optionnel)
 * Audit minimal pour le TransactionManager P0
 */
export class ConstitutionalAuditLogger {
  constructor(private readonly pg: Pool) {}

  async log(entry: AuditLogEntry): Promise<void> {
    const client = await this.pg.connect();
    
    try {
      await client.query(
        `
        INSERT INTO audit_trail (
          event_id,
          actor_id,
          actor_type,
          source,
          created_at
        )
        SELECT 
          id,
          $1,
          $2,
          $3,
          $4
        FROM domain_events
        WHERE aggregate_id = $5
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [
          entry.userId || 'SYSTEM',
          'USER',
          'TRANSACTION_MANAGER_P0',
          entry.timestamp,
          entry.aggregateId
        ]
      );
      
    } catch (error) {
      // L'audit ne doit jamais faire échouer la transaction
      console.warn('Audit logging failed:', error);
    } finally {
      client.release();
    }
  }
}

/**
 * 🏭 FACTORY POUR CRÉATION TM CONSTITUTIONNEL
 */
export class ConstitutionalTransactionManagerFactory {
  
  /**
   * Création du TransactionManager P0 avec configuration automatique
   */
  static create(
    databaseUrl: string,
    enableAudit: boolean = true
  ): ConstitutionalTransactionManagerP0 {
    const pg = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    const audit = enableAudit 
      ? new ConstitutionalAuditLogger(pg).log.bind(new ConstitutionalAuditLogger(pg))
      : undefined;

    return new ConstitutionalTransactionManagerP0(pg, audit);
  }

  /**
   * Création avec validation de conformité
   */
  static async createAndValidate(
    databaseUrl: string,
    enableAudit: boolean = true
  ): Promise<{
    transactionManager: ConstitutionalTransactionManagerP0;
    compliance: {
      isCompliant: boolean;
      issues: string[];
      recommendations: string[];
    };
  }> {
    const tm = this.create(databaseUrl, enableAudit);
    const compliance = await tm.validateConstitutionalCompliance();
    
    return {
      transactionManager: tm,
      compliance
    };
  }
}
