/**
 * 🏛️ CONSTITUTIONAL LEDGER ADAPTER
 * Adaptateur pour transition non destructive vers schéma constitutionnel
 * 
 * Principes :
 * - Compatibilité totale avec SPOFE existant
 * - Insertion via schéma constitutionnel
 * - Lecture optimisée via vues
 * - Validation cryptographique automatique
 */

import { Pool, PoolClient } from 'pg';
import { randomUUID } from 'crypto';

export interface DomainEvent {
  id?: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: any;
  actorId?: string;
  actorType?: 'USER' | 'SYSTEM' | 'MODULE' | 'GUARDIAN';
  source?: string;
  // Propriétés ajoutées par la base de données
  sequence?: number;
  currentHash?: string;
  previousHash?: string;
  createdAt?: Date;
}

export interface AuditRecord {
  id?: string;
  eventId: string;
  actorId?: string;
  actorType?: string;
  source?: string;
  createdAt?: Date;
}

export interface LedgerStatistics {
  totalEvents: number;
  firstEventDate: Date;
  lastEventDate: Date;
  chainIntegrity: boolean;
  uniqueAggregates: number;
  aggregateTypes: string[];
  eventTypes: string[];
}

export class ConstitutionalLedger {
  protected pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * 🔐 Insertion d'événement principal (compatible SPOFE)
   */
  async insertEvent(event: DomainEvent): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT insert_domain_event(
          $1::UUID,
          $2::TEXT,
          $3::TEXT,
          $4::JSONB,
          $5::TEXT,
          $6::TEXT,
          $7::TEXT
        ) as event_id
      `;
      
      const values = [
        event.aggregateId,
        event.aggregateType,
        event.eventType,
        JSON.stringify(event.payload),
        event.actorId || null,
        event.actorType || 'SYSTEM',
        event.source || 'SPOFE_MODULE'
      ];
      
      const result = await client.query(query, values);
      return result.rows[0].event_id;
      
    } finally {
      client.release();
    }
  }

  /**
   * 📊 Insertion événement comptabilité (spécialisé)
   */
  async insertAccountingEvent(
    aggregateId: string,
    eventType: string,
    payload: any,
    actorId?: string
  ): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT insert_accounting_event($1::UUID, $2::TEXT, $3::JSONB, $4::TEXT) as event_id';
      const values = [aggregateId, eventType, JSON.stringify(payload), actorId || null];
      
      const result = await client.query(query, values);
      return result.rows[0].event_id;
      
    } finally {
      client.release();
    }
  }

  /**
   * 🏢 Insertion événement tiers (spécialisé)
   */
  async insertThirdPartyEvent(
    aggregateId: string,
    eventType: string,
    payload: any,
    actorId?: string
  ): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT insert_third_party_event($1::UUID, $2::TEXT, $3::JSONB, $4::TEXT) as event_id';
      const values = [aggregateId, eventType, JSON.stringify(payload), actorId || null];
      
      const result = await client.query(query, values);
      return result.rows[0].event_id;
      
    } finally {
      client.release();
    }
  }

  /**
   * 📖 Lecture des événements par agrégat (via vue optimisée)
   */
  async getAggregateEvents(aggregateId: string, fromSequence?: number): Promise<DomainEvent[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT 
          aggregate_id as "aggregateId",
          aggregate_type as "aggregateType",
          event_type as "eventType",
          payload,
          sequence,
          created_at as "createdAt",
          current_hash as "currentHash",
          previous_hash as "previousHash"
        FROM v_aggregate_events
        WHERE aggregate_id = $1
      `;
      
      const values: any[] = [aggregateId];
      
      if (fromSequence) {
        query += ' AND sequence >= $2';
        values.push(fromSequence);
      }
      
      query += ' ORDER BY sequence';
      
      const result = await client.query(query, values);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  /**
   * 🕐 Lecture timeline système (via vue optimisée)
   */
  async getSystemTimeline(limit: number = 100, offset: number = 0): Promise<DomainEvent[]> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          sequence,
          aggregate_id as "aggregateId",
          aggregate_type as "aggregateType",
          event_type as "eventType",
          payload,
          created_at as "createdAt",
          current_hash as "currentHash"
        FROM v_system_timeline
        ORDER BY sequence
        LIMIT $1 OFFSET $2
      `;
      
      const result = await client.query(query, [limit, offset]);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  /**
   * 🔍 Validation intégrité chaîne cryptographique
   */
  async validateCryptographicChain(): Promise<{
    isValid: boolean;
    totalEvents: number;
    validEvents: number;
    firstError?: any;
  }> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM validate_cryptographic_chain()';
      const result = await client.query(query);
      
      const totalEvents = result.rows.length;
      const validEvents = result.rows.filter(row => row.is_valid).length;
      const firstError = result.rows.find(row => !row.is_valid);
      
      return {
        isValid: validEvents === totalEvents,
        totalEvents,
        validEvents,
        firstError: firstError || null
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 📊 Statistiques du ledger (pour monitoring BUILD_PROOF)
   */
  async getLedgerStatistics(): Promise<LedgerStatistics> {
    const client = await this.pool.connect();
    
    try {
      const query = 'SELECT * FROM get_ledger_statistics()';
      const result = await client.query(query);
      
      const stats = result.rows[0];
      return {
        totalEvents: parseInt(stats.total_events),
        firstEventDate: new Date(stats.first_event_date),
        lastEventDate: new Date(stats.last_event_date),
        chainIntegrity: stats.chain_integrity,
        uniqueAggregates: parseInt(stats.unique_aggregates),
        aggregateTypes: stats.aggregate_types,
        eventTypes: stats.event_types
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 🔍 Recherche d'événements par critères
   */
  async searchEvents(criteria: {
    aggregateType?: string;
    eventType?: string;
    fromDate?: Date;
    toDate?: Date;
    actorId?: string;
  }): Promise<DomainEvent[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT DISTINCT
          de.aggregate_id as "aggregateId",
          de.aggregate_type as "aggregateType",
          de.event_type as "eventType",
          de.payload,
          de.sequence,
          de.created_at as "createdAt",
          de.current_hash as "currentHash"
        FROM domain_events de
        LEFT JOIN audit_trail at ON de.id = at.event_id
        WHERE 1=1
      `;
      
      const values: any[] = [];
      let paramIndex = 1;
      
      if (criteria.aggregateType) {
        query += ` AND de.aggregate_type = $${paramIndex++}`;
        values.push(criteria.aggregateType);
      }
      
      if (criteria.eventType) {
        query += ` AND de.event_type = $${paramIndex++}`;
        values.push(criteria.eventType);
      }
      
      if (criteria.fromDate) {
        query += ` AND de.created_at >= $${paramIndex++}`;
        values.push(criteria.fromDate);
      }
      
      if (criteria.toDate) {
        query += ` AND de.created_at <= $${paramIndex++}`;
        values.push(criteria.toDate);
      }
      
      if (criteria.actorId) {
        query += ` AND at.actor_id = $${paramIndex++}`;
        values.push(criteria.actorId);
      }
      
      query += ' ORDER BY de.sequence DESC';
      
      const result = await client.query(query, values);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  /**
   * 🏛️ Vérification intégrité rapide
   */
  async checkIntegrity(): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT check_ledger_integrity() as integrity');
      return result.rows[0].integrity;
      
    } finally {
      client.release();
    }
  }

  /**
   * 🔧 Test de connexion au schéma constitutionnel
   */
  async testConnection(): Promise<{
    connected: boolean;
    schemaExists: boolean;
    tablesExist: boolean;
    triggersActive: boolean;
    error?: string;
  }> {
    const client = await this.pool.connect();
    
    try {
      // Test connexion basique
      await client.query('SELECT 1');
      
      // Vérification existence tables
      const tablesResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('domain_events', 'audit_trail')
      `);
      
      const tablesExist = parseInt(tablesResult.rows[0].count) === 2;
      
      // Vérification triggers actifs
      const triggersResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name LIKE '%no_%'
      `);
      
      const triggersActive = parseInt(triggersResult.rows[0].count) >= 4;
      
      return {
        connected: true,
        schemaExists: true,
        tablesExist,
        triggersActive
      };
      
    } catch (error) {
      return {
        connected: false,
        schemaExists: false,
        tablesExist: false,
        triggersActive: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      client.release();
    }
  }

  /**
   * 🔄 Fermeture propre des connexions
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * 🏛️ CONSTITUTIONAL TRANSACTION MANAGER
 * Extension du TransactionManager pour schéma constitutionnel
 */
export class ConstitutionalTransactionManager extends ConstitutionalLedger {
  
  constructor(databaseUrl: string) {
    super(databaseUrl);
  }

  /**
   * 🔐 Exécution transactionnelle avec validation Guardian
   */
  async executeWithGuardian<T>(
    event: DomainEvent,
    guardianValidation: () => Promise<void>
  ): Promise<{ eventId: string; result: T }> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Validation Guardian (inchangée)
      await guardianValidation();
      
      // 2. Insertion événement constitutionnel
      const eventId = await this.insertEvent(event);
      
      // 3. Commit transaction
      await client.query('COMMIT');
      
      return { eventId, result: null as T };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 📊 Insertion multiple en batch (pour performance)
   */
  async insertBatchEvents(events: DomainEvent[]): Promise<string[]> {
    const client = await this.pool.connect();
    const eventIds: string[] = [];
    
    try {
      await client.query('BEGIN');
      
      for (const event of events) {
        const eventId = await this.insertEvent(event);
        eventIds.push(eventId);
      }
      
      await client.query('COMMIT');
      return eventIds;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * 🎯 FACTORY POUR SPOFE COMPATIBILITY
 */
export class ConstitutionalLedgerFactory {
  
  /**
   * Création du ledger constitutionnel avec configuration SPOFE
   */
  static createFromEnvironment(): ConstitutionalLedger {
    const databaseUrl = process.env.DATABASE_URL || 
                      'postgresql://spofe:password@localhost:5432/spofe';
    
    return new ConstitutionalLedger(databaseUrl);
  }
  
  /**
   * Création du transaction manager constitutionnel
   */
  static createTransactionManager(): ConstitutionalTransactionManager {
    const databaseUrl = process.env.DATABASE_URL || 
                      'postgresql://spofe:password@localhost:5432/spofe';
    
    return new ConstitutionalTransactionManager(databaseUrl);
  }
}
