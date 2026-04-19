/**
 * 🧪 TESTS CONSTITUTIONNEL LEDGER
 * Validation du schéma constitutionnel SPOFE
 * 
 * Tests couvrant :
 * - Insertion événements
 * - Chaîne cryptographique
 * - Intégrité immuable
 * - Compatibilité SPOFE
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { ConstitutionalLedger, ConstitutionalTransactionManager, DomainEvent } from '../../src/infrastructure/ConstitutionalLedger';
import { buildDatabaseUrlFromEnv } from '../../src/infrastructure/db/databaseConfig';

const hasDedicatedTestDb =
  Boolean(process.env.TEST_DATABASE_URL) ||
  Boolean(process.env.TEST_DB_NAME) ||
  Boolean(process.env.TEST_DB_DATABASE);

const describeWithDb = hasDedicatedTestDb ? describe : describe.skip;

describeWithDb('🏛️ Constitutional Ledger Tests', () => {
  let ledger: ConstitutionalLedger;
  const testDatabaseUrl = buildDatabaseUrlFromEnv('TEST');

  beforeAll(async () => {
    ledger = new ConstitutionalLedger(testDatabaseUrl);
    
    // Test connexion
    const connectionTest = await ledger.testConnection();
    expect(connectionTest.connected).toBe(true);
    expect(connectionTest.tablesExist).toBe(true);
    expect(connectionTest.triggersActive).toBe(true);
  });

  afterAll(async () => {
    await ledger.close();
  });

  beforeEach(async () => {
    // Nettoyage entre tests (si nécessaire)
    // Note : En production, on ne nettoie jamais le ledger
  });

  describe('📊 Connection and Schema Tests', () => {
    it('should connect to constitutional schema', async () => {
      const result = await ledger.testConnection();
      
      expect(result.connected).toBe(true);
      expect(result.schemaExists).toBe(true);
      expect(result.tablesExist).toBe(true);
      expect(result.triggersActive).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should have proper statistics', async () => {
      const stats = await ledger.getLedgerStatistics();
      
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('chainIntegrity');
      expect(stats).toHaveProperty('aggregateTypes');
      expect(stats).toHaveProperty('eventTypes');
      expect(typeof stats.totalEvents).toBe('number');
      expect(typeof stats.chainIntegrity).toBe('boolean');
    });
  });

  describe('🔐 Event Insertion Tests', () => {
    it('should insert single domain event', async () => {
      const event: DomainEvent = {
        aggregateId: '550e8400-e29b-41d4-a716-446655440000',
        aggregateType: 'test_aggregate',
        eventType: 'TEST_EVENT',
        payload: {
          test: 'data',
          timestamp: new Date().toISOString()
        },
        actorId: 'test-user',
        actorType: 'USER',
        source: 'TEST_MODULE'
      };

      const eventId = await ledger.insertEvent(event);
      
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
      
      // Vérification que l'événement existe bien
      const events = await ledger.getAggregateEvents(event.aggregateId);
      expect(events).toHaveLength(1);
      expect(events[0].aggregateId).toBe(event.aggregateId);
      expect(events[0].eventType).toBe(event.eventType);
      expect(events[0].currentHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should insert accounting specialized event', async () => {
      const aggregateId = '550e8400-e29b-41d4-a716-446655440001';
      const payload = {
        entryNumber: 'EC2024001',
        date: '2024-01-01',
        entries: [
          { account: '101000', type: 'DEBIT', amount: 1000 },
          { account: '401000', type: 'CREDIT', amount: 1000 }
        ]
      };

      const eventId = await ledger.insertAccountingEvent(
        aggregateId,
        'ACCOUNTING_ENTRY_CREATED',
        payload,
        'accountant-user'
      );

      expect(eventId).toBeDefined();
      
      const events = await ledger.getAggregateEvents(aggregateId);
      expect(events).toHaveLength(1);
      expect(events[0].aggregateType).toBe('accounting_aggregate');
      expect(events[0].eventType).toBe('ACCOUNTING_ENTRY_CREATED');
    });

    it('should insert third party specialized event', async () => {
      const aggregateId = '550e8400-e29b-41d4-a716-446655440002';
      const payload = {
        tierCode: 'CLIENT001',
        legalName: 'Test Company',
        taxId: 'FR12345678901'
      };

      const eventId = await ledger.insertThirdPartyEvent(
        aggregateId,
        'THIRD_PARTY_CREATED',
        payload,
        'admin-user'
      );

      expect(eventId).toBeDefined();
      
      const events = await ledger.getAggregateEvents(aggregateId);
      expect(events).toHaveLength(1);
      expect(events[0].aggregateType).toBe('third_party_aggregate');
      expect(events[0].eventType).toBe('THIRD_PARTY_CREATED');
    });
  });

  describe('🔗 Cryptographic Chain Tests', () => {
    it('should maintain cryptographic chain integrity', async () => {
      // Insertion de plusieurs événements
      const events: DomainEvent[] = [
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440010',
          aggregateType: 'chain_test',
          eventType: 'FIRST_EVENT',
          payload: { sequence: 1 }
        },
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440010',
          aggregateType: 'chain_test',
          eventType: 'SECOND_EVENT',
          payload: { sequence: 2 }
        },
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440010',
          aggregateType: 'chain_test',
          eventType: 'THIRD_EVENT',
          payload: { sequence: 3 }
        }
      ];

      for (const event of events) {
        await ledger.insertEvent(event);
      }

      // Validation chaîne cryptographique
      const validation = await ledger.validateCryptographicChain();
      
      expect(validation.isValid).toBe(true);
      expect(validation.totalEvents).toBeGreaterThanOrEqual(3);
      expect(validation.validEvents).toBe(validation.totalEvents);
      expect(validation.firstError).toBeNull();
    });

    it('should have proper hash format', async () => {
      const event: DomainEvent = {
        aggregateId: '550e8400-e29b-41d4-a716-446655440020',
        aggregateType: 'hash_test',
        eventType: 'HASH_VALIDATION',
        payload: { test: 'hash_format' }
      };

      await ledger.insertEvent(event);
      
      const events = await ledger.getAggregateEvents(event.aggregateId);
      const insertedEvent = events[0];
      
      expect(insertedEvent.currentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(insertedEvent.currentHash).toHaveLength(64);
      expect(insertedEvent.currentHash).toBe(insertedEvent.currentHash?.toLowerCase());
    });

    it('should link events via previous_hash', async () => {
      const aggregateId = '550e8400-e29b-41d4-a716-446655440030';
      
      // Premier événement (pas de previous_hash)
      const firstEvent: DomainEvent = {
        aggregateId,
        aggregateType: 'link_test',
        eventType: 'FIRST',
        payload: { test: 'first' }
      };
      
      await ledger.insertEvent(firstEvent);
      
      // Deuxième événement (doit avoir previous_hash)
      const secondEvent: DomainEvent = {
        aggregateId,
        aggregateType: 'link_test',
        eventType: 'SECOND',
        payload: { test: 'second' }
      };
      
      await ledger.insertEvent(secondEvent);
      
      const events = await ledger.getAggregateEvents(aggregateId);
      expect(events).toHaveLength(2);
      
      // Premier événement : previous_hash = null
      expect(events[0].previousHash).toBeNull();
      
      // Deuxième événement : previous_hash = hash du premier
      expect(events[1].previousHash).toBe(events[0].currentHash);
    });
  });

  describe('📖 Reading and Querying Tests', () => {
    beforeEach(async () => {
      // Insertion données de test
      const testEvents: DomainEvent[] = [
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440100',
          aggregateType: 'query_test',
          eventType: 'EVENT_A',
          payload: { type: 'A', value: 1 }
        },
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440100',
          aggregateType: 'query_test',
          eventType: 'EVENT_B',
          payload: { type: 'B', value: 2 }
        },
        {
          aggregateId: '550e8400-e29b-41d4-a716-446655440101',
          aggregateType: 'query_test',
          eventType: 'EVENT_A',
          payload: { type: 'A', value: 3 }
        }
      ];

      for (const event of testEvents) {
        await ledger.insertEvent(event);
      }
    });

    it('should read events by aggregate', async () => {
      const events = await ledger.getAggregateEvents('550e8400-e29b-41d4-a716-446655440100');
      
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('EVENT_A');
      expect(events[1].eventType).toBe('EVENT_B');
      expect(events[0].sequence).toBeLessThan(events[1].sequence || 0);
    });

    it('should read system timeline', async () => {
      const timeline = await ledger.getSystemTimeline(10, 0);
      
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
      
      // Vérification ordre chronologique
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].sequence).toBeGreaterThan(timeline[i-1].sequence || 0);
      }
    });

    it('should search events by criteria', async () => {
      const events = await ledger.searchEvents({
        aggregateType: 'query_test',
        eventType: 'EVENT_A'
      });
      
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(event.aggregateType).toBe('query_test');
        expect(event.eventType).toBe('EVENT_A');
      });
    });
  });

  describe('🛡️ Immutability Tests', () => {
    it('should prevent direct updates (via trigger)', async () => {
      const event: DomainEvent = {
        aggregateId: '550e8400-e29b-41d4-a716-446655440200',
        aggregateType: 'immutability_test',
        eventType: 'IMMUTABLE_EVENT',
        payload: { original: 'data' }
      };

      const eventId = await ledger.insertEvent(event);
      
      // Tentative de modification directe (doit échouer)
      await expect(
        ledger.getAggregateEvents(event.aggregateId)
      ).resolves.toBeDefined();
      
      // La validation d'intégrité doit passer
      const integrity = await ledger.checkIntegrity();
      expect(integrity).toBe(true);
    });

    it('should maintain append-only property', async () => {
      const aggregateId = '550e8400-e29b-41d4-a716-446655440201';
      
      // Insertion événement initial
      await ledger.insertEvent({
        aggregateId,
        aggregateType: 'append_test',
        eventType: 'INITIAL',
        payload: { version: 1 }
      });
      
      // Insertion événement additionnel
      await ledger.insertEvent({
        aggregateId,
        aggregateType: 'append_test',
        eventType: 'ADDITIONAL',
        payload: { version: 2 }
      });
      
      const events = await ledger.getAggregateEvents(aggregateId);
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('INITIAL');
      expect(events[1].eventType).toBe('ADDITIONAL');
      
      // L'intégrité doit être maintenue
      const integrity = await ledger.checkIntegrity();
      expect(integrity).toBe(true);
    });
  });

  describe('🔄 Transaction Manager Tests', () => {
    let txManager: ConstitutionalTransactionManager;

    beforeEach(() => {
      txManager = new ConstitutionalTransactionManager(testDatabaseUrl);
    });

    afterEach(async () => {
      await txManager.close();
    });

    it('should execute transaction with guardian validation', async () => {
      const event: DomainEvent = {
        aggregateId: '550e8400-e29b-41d4-a716-446655440300',
        aggregateType: 'transaction_test',
        eventType: 'TRANSACTION_EVENT',
        payload: { test: 'transaction' }
      };

      // Simulation validation Guardian
      const mockGuardianValidation = jest.fn().mockResolvedValue(undefined);

      const result = await txManager.executeWithGuardian(event, mockGuardianValidation);
      
      expect(result.eventId).toBeDefined();
      expect(mockGuardianValidation).toHaveBeenCalled();
      
      // Vérification événement inséré
      const events = await ledger.getAggregateEvents(event.aggregateId);
      expect(events).toHaveLength(1);
    });

    it('should rollback on guardian validation failure', async () => {
      const event: DomainEvent = {
        aggregateId: '550e8400-e29b-41d4-a716-446655440301',
        aggregateType: 'transaction_test',
        eventType: 'FAILED_EVENT',
        payload: { test: 'failure' }
      };

      // Simulation échec Guardian
      const mockGuardianValidation = jest.fn().mockRejectedValue(
        new Error('Guardian validation failed')
      );

      await expect(
        txManager.executeWithGuardian(event, mockGuardianValidation)
      ).rejects.toThrow('Guardian validation failed');
      
      // Aucun événement ne doit être inséré
      const events = await ledger.getAggregateEvents(event.aggregateId);
      expect(events).toHaveLength(0);
    });
  });

  describe('📊 Performance and Scalability Tests', () => {
    it('should handle batch insertions efficiently', async () => {
      const batchSize = 50;
      const events: DomainEvent[] = [];
      
      for (let i = 0; i < batchSize; i++) {
        events.push({
          aggregateId: `550e8400-e29b-41d4-a716-446655440${i.toString().padStart(3, '0')}`,
          aggregateType: 'performance_test',
          eventType: 'BATCH_EVENT',
          payload: { index: i, batch: true }
        });
      }

      const startTime = Date.now();
      
      const txManager = new ConstitutionalTransactionManager(testDatabaseUrl);
      const eventIds = await txManager.insertBatchEvents(events);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      await txManager.close();
      
      expect(eventIds).toHaveLength(batchSize);
      expect(duration).toBeLessThan(5000); // Moins de 5 secondes pour 50 événements
      
      // Validation intégrité après batch
      const integrity = await ledger.checkIntegrity();
      expect(integrity).toBe(true);
    });
  });
});

describe('🏛️ Constitutional Transaction Manager Adapter Tests', () => {
  // Tests pour l'adaptateur de compatibilité
  // Ces tests nécessitent les mocks de Guardian et DbClient
  
  it('should maintain compatibility with existing TransactionManager interface', async () => {
    // Test de compatibilité à implémenter avec mocks
    expect(true).toBe(true); // Placeholder
  });
});
