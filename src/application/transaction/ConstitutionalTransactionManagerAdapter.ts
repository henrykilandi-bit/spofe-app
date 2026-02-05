/**
 * 🏛️ CONSTITUTIONAL TRANSACTION MANAGER ADAPTER
 * Adaptateur non-destructif pour transition vers schéma constitutionnel
 * 
 * Principes :
 * - Compatibilité 100% avec TransactionManager existant
 * - Utilisation schéma constitutionnel en interne
 * - Aucune modification des Guardians
 * - Aucune modification des Commands
 * - Migration transparente
 */

import { 
  TransactionManager, 
  ExecuteDecisionInput, 
  ExecuteDecisionResult,
  GuardianViolationError,
  ValidationError,
  DatabaseError
} from './TransactionManager';

import { 
  GuardianPort 
} from './GuardianPort';

import { 
  DbClient 
} from './DbClient';

import { 
  ConstitutionalLedger,
  ConstitutionalTransactionManager,
  DomainEvent
} from '../../infrastructure/ConstitutionalLedger';

/**
 * Adaptateur qui maintient l'interface TransactionManager existante
 * mais utilise le schéma constitutionnel en interne
 */
export class ConstitutionalTransactionManagerAdapter {
  private guardian: GuardianPort;
  private db: DbClient;
  private constitutionalLedger: ConstitutionalTransactionManager;

  constructor(
    guardian: GuardianPort,
    db: DbClient,
    databaseUrl?: string
  ) {
    // Conservation des dépendances existantes
    this.guardian = guardian;
    this.db = db;
    
    // Initialisation du ledger constitutionnel
    const url = databaseUrl || process.env.DATABASE_URL || 'postgresql://spofe:password@localhost:5432/spofe';
    this.constitutionalLedger = new ConstitutionalTransactionManager(url);
  }

  /**
   * 🔐 Exécution décision avec schéma constitutionnel
   * Maintient l'interface existante mais utilise domain_events
   */
  async executeDecision(
    input: ExecuteDecisionInput
  ): Promise<ExecuteDecisionResult> {
    try {
      // ─────────────────────────────────────────────
      // 1. GUARDIAN VALIDATION (INCHANGÉ)
      // ─────────────────────────────────────────────
      const verdict = this.guardian.validateDecision({
        processName: input.processName,
        decisionType: input.decisionType,
        actorRole: input.actorRole,
        payload: input.payload,
        context: input.context,
      });

      if (!verdict.ok) {
        throw new GuardianViolationError(
          `Guardian validation failed: ${verdict.violationCode ?? 'UNKNOWN'}`
        );
      }

      // ─────────────────────────────────────────────
      // 2. VALIDATION SCHÉMA (INCHANGÉ)
      // ─────────────────────────────────────────────
      this.validateInput(input);

      // ─────────────────────────────────────────────
      // 3. CONSTITUTIONAL LEDGER INSERTION
      // ─────────────────────────────────────────────
      // Conversion vers format constitutionnel
      
      // Event principal : la décision
      const decisionEvent: DomainEvent = {
        aggregateId: input.decisionId,
        aggregateType: `${input.processName}_decision`,
        eventType: input.decisionType,
        payload: {
          decisionId: input.decisionId,
          processName: input.processName,
          actorRole: input.actorRole,
          decisionType: input.decisionType,
          payload: input.payload,
          context: input.context,
          guardianChecksum: verdict.checksum,
          invariantVersion: verdict.invariantVersion
        },
        actorId: this.extractActorId(input.context),
        actorType: input.actorRole as 'USER' | 'SYSTEM' | 'MODULE' | 'GUARDIAN',
        source: `${input.processName}_MODULE`
      };

      // Événements conséquences
      const consequenceEvents: DomainEvent[] = input.events.map(event => ({
        aggregateId: input.decisionId,
        aggregateType: `${input.processName}_aggregate`,
        eventType: event.eventType,
        payload: {
          eventId: event.eventId,
          decisionId: input.decisionId,
          eventType: event.eventType,
          payload: event.payload
        },
        actorId: this.extractActorId(input.context),
        actorType: input.actorRole as 'USER' | 'SYSTEM' | 'MODULE' | 'GUARDIAN',
        source: `${input.processName}_MODULE`
      }));

      // Événements faits dérivés
      const factEvents: DomainEvent[] = input.facts.map(fact => ({
        aggregateId: fact.aggregateId,
        aggregateType: `${input.processName}_fact`,
        eventType: fact.factType,
        payload: {
          factId: fact.factId,
          aggregateId: fact.aggregateId,
          factType: fact.factType,
          payload: fact.payload,
          causedByEvent: fact.causedByEvent,
          decisionId: input.decisionId
        },
        actorId: this.extractActorId(input.context),
        actorType: input.actorRole as 'USER' | 'SYSTEM' | 'MODULE' | 'GUARDIAN',
        source: `${input.processName}_MODULE`
      }));

      // Insertion transactionnelle dans ledger constitutionnel
      const allEvents = [decisionEvent, ...consequenceEvents, ...factEvents];
      const eventIds = await this.constitutionalLedger.insertBatchEvents(allEvents);

      // ─────────────────────────────────────────────
      // 4. LEGACY DB INSERTION (PARALLÈLE)
      // ─────────────────────────────────────────────
      // Maintien compatibilité avec tables existantes
      try {
        await this.insertLegacyData(input, verdict);
      } catch (legacyError) {
        // L'insertion legacy échoue mais le ledger constitutionnel a fonctionné
        console.warn('Legacy DB insertion failed, but constitutional ledger succeeded:', legacyError);
        // On continue car le ledger constitutionnel est la source de vérité
      }

      // ─────────────────────────────────────────────
      // 5. RÉSULTAT (FORMAT INCHANGÉ)
      // ─────────────────────────────────────────────
      return {
        success: true,
        decisionId: input.decisionId,
        checksum: verdict.checksum || 'NO_CHECKSUM',
      };

    } catch (error) {
      if (error instanceof GuardianViolationError || 
          error instanceof ValidationError || 
          error instanceof DatabaseError) {
        throw error;
      }
      
      // Erreur inconnue -> DatabaseError
      throw new DatabaseError(
        `Constitutional transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 📊 Insertion dans tables legacy (compatibilité)
   */
  private async insertLegacyData(input: ExecuteDecisionInput, verdict: any): Promise<void> {
    // Utilisation du DbClient original pour compatibilité
    await this.db.begin();

    try {
      // Insertion décision (legacy)
      await this.db.insertDecision({
        decision_id: input.decisionId,
        process_name: input.processName,
        actor_role: input.actorRole as 'SYSTEM' | 'ADMIN' | 'USER',
        decision_type: input.decisionType as 'CREATE' | 'UPDATE' | 'CLOSE' | 'TRANSFER',
        payload: input.payload,
      });

      // Insertion événements (legacy)
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

      // Insertion faits (legacy)
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

      // Insertion audit (legacy)
      await this.db.insertAudit({
        audit_id: this.generateUUID(),
        decision_id: input.decisionId,
        invariant_version: verdict.invariantVersion,
        checksum: verdict.checksum,
      });

      await this.db.commit();

    } catch (error) {
      await this.db.rollback();
      throw error;
    }
  }

  /**
   * 🔍 Extraction actor ID depuis contexte
   */
  private extractActorId(context: unknown): string {
    if (context && typeof context === 'object' && 'userId' in context) {
      const userId = (context as any).userId;
      return userId ? String(userId) : 'SYSTEM';
    }
    return 'SYSTEM';
  }

  /**
   * 🧪 Validation intégrité ledger constitutionnel
   */
  async validateConstitutionalIntegrity(): Promise<{
    isValid: boolean;
    totalEvents: number;
    validEvents: number;
    firstError?: any;
  }> {
    return await this.constitutionalLedger.validateCryptographicChain();
  }

  /**
   * 📊 Statistiques ledger constitutionnel
   */
  async getConstitutionalStatistics() {
    return await this.constitutionalLedger.getLedgerStatistics();
  }

  /**
   * 🔍 Test connexion schéma constitutionnel
   */
  async testConstitutionalConnection() {
    return await this.constitutionalLedger.testConnection();
  }

  /**
   * 🔄 Fermeture propre
   */
  async close(): Promise<void> {
    await this.constitutionalLedger.close();
  }

  // ─────────────────────────────────────────────
  // Méthodes privées de validation
  // ─────────────────────────────────────────────

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

  private isValidUUID(value: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(value);
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * 🏭 FACTORY POUR CRÉATION TRANSPARENTE
 */
export class ConstitutionalTransactionManagerFactory {
  
  /**
   * Crée l'adaptateur avec configuration automatique
   */
  static create(
    guardian: GuardianPort,
    db: DbClient,
    databaseUrl?: string
  ): ConstitutionalTransactionManagerAdapter {
    return new ConstitutionalTransactionManagerAdapter(guardian, db, databaseUrl);
  }

  /**
   * Test de migration vers schéma constitutionnel
   */
  static async testMigration(
    guardian: GuardianPort,
    db: DbClient,
    databaseUrl?: string
  ): Promise<{
    canMigrate: boolean;
    connectionTest: any;
    integrityTest: any;
    compatibilityScore: number;
  }> {
    const adapter = new ConstitutionalTransactionManagerAdapter(guardian, db, databaseUrl);
    
    try {
      // Test connexion
      const connectionTest = await adapter.testConstitutionalConnection();
      
      // Test intégrité
      const integrityTest = await adapter.validateConstitutionalIntegrity();
      
      // Calcul score de compatibilité
      let compatibilityScore = 0;
      
      if (connectionTest.connected) compatibilityScore += 30;
      if (connectionTest.schemaExists) compatibilityScore += 20;
      if (connectionTest.tablesExist) compatibilityScore += 20;
      if (connectionTest.triggersActive) compatibilityScore += 15;
      if (integrityTest.isValid) compatibilityScore += 15;
      
      return {
        canMigrate: compatibilityScore >= 80,
        connectionTest,
        integrityTest,
        compatibilityScore
      };
      
    } finally {
      await adapter.close();
    }
  }
}
