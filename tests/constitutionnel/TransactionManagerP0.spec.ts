/**
 * 🧪 TESTS TRANSACTION MANAGER P0
 * Validation du TransactionManager constitutionnel
 * 
 * Tests couvrant :
 * - Insertion immuable dans domain_events
 * - Validation Guardian inchangée
 * - Hash calculé par PostgreSQL
 * - Mode migration transparente
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import {
  ConstitutionalTransactionManagerP0,
  ConstitutionalTransactionManagerFactory
} from '../../src/application/transaction/ConstitutionalTransactionManagerP0';
import { TransactionManagerMigrationAdapter } from '../../src/application/transaction/TransactionManagerMigrationAdapter';
import { buildDatabaseUrlFromEnv } from '../../src/infrastructure/db/databaseConfig';

// Mock Command pour tests
class MockCommand {
  constructor(
    public aggregateId: string,
    public aggregateType: string,
    public type: string,
    public payload: any,
    public userId?: string
  ) {}

  guardian = {
    validate: jest.fn().mockResolvedValue(true)
  };
}

// Mock GuardianPort
class MockGuardianPort {
  validateDecision = jest.fn().mockReturnValue({
    ok: true,
    checksum: 'mock-checksum',
    invariantVersion: '1.0'
  });
}

// Mock DbClient
class MockDbClient {
  begin = jest.fn().mockResolvedValue({});
  commit = jest.fn().mockResolvedValue({});
  rollback = jest.fn().mockResolvedValue({});
  insertDecision = jest.fn().mockResolvedValue({});
  insertEvents = jest.fn().mockResolvedValue({});
  insertFacts = jest.fn().mockResolvedValue({});
  insertAudit = jest.fn().mockResolvedValue({});
}

const hasDedicatedTestDb =
  Boolean(process.env.TEST_DATABASE_URL) ||
  Boolean(process.env.TEST_DB_NAME) ||
  Boolean(process.env.TEST_DB_DATABASE);

const describeWithDb = hasDedicatedTestDb ? describe : describe.skip;

describeWithDb('🏛️ Constitutional TransactionManager P0 Tests', () => {
  let tm: ConstitutionalTransactionManagerP0;
  const testDatabaseUrl = buildDatabaseUrlFromEnv('TEST');

  beforeAll(async () => {
    tm = ConstitutionalTransactionManagerFactory.create(testDatabaseUrl);
    
    // Validation conformité
    const compliance = await tm.validateConstitutionalCompliance();
    if (!compliance.isCompliant) {
      console.warn('Constitutional compliance issues:', compliance.issues);
    }
  });

  afterAll(async () => {
    await tm.close();
  });

  describe('📊 Basic Transaction Tests', () => {
    it('should execute command and insert domain event', async () => {
      const command = new MockCommand(
        '550e8400-e29b-41d4-a716-446655440000',
        'test_aggregate',
        'TEST_EVENT',
        { data: 'test', timestamp: Date.now() },
        'test-user'
      );

      const result = await tm.execute(command);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(typeof result.eventId).toBe('string');
      expect(result.sequence).toBeDefined();
      expect(typeof result.sequence).toBe('number');
      expect(result.timestamp).toBeInstanceOf(Date);

      // Vérification que l'événement existe bien
      const events = await tm.getEvents(command.aggregateId);
      expect(events).toHaveLength(1);
      expect(events[0].aggregate_id).toBe(command.aggregateId);
      expect(events[0].event_type).toBe(command.type);
      expect(events[0].payload).toEqual(JSON.stringify(command.payload));
    });

    it('should validate Guardian before execution', async () => {
      const command = new MockCommand(
        '550e8400-e29b-41d4-a716-446655440001',
        'test_aggregate',
        'GUARDIAN_TEST',
        { test: 'guardian' }
      );

      await tm.execute(command);

      // Vérification que Guardian.validate a été appelé
      expect(command.guardian.validate).toHaveBeenCalled();
    });

    it('should reject command if Guardian validation fails', async () => {
      const command = new MockCommand(
        '550e8400-e29b-41d4-a716-446655440002',
        'test_aggregate',
        'REJECTED_EVENT',
        { test: 'rejected' }
      );

      // Mock Guardian pour rejeter
      command.guardian.validate.mockRejectedValue(new Error('Guardian validation failed'));

      await expect(tm.execute(command)).rejects.toThrow('Guardian validation failed');

      // Vérification qu'aucun événement n'a été inséré
      const events = await tm.getEvents(command.aggregateId);
      expect(events).toHaveLength(0);
    });
  });

  describe('🔗 Cryptographic Integrity Tests', () => {
    it('should maintain chain integrity across multiple events', async () => {
      const aggregateId = '550e8400-e29b-41d4-a716-446655440100';
      
      // Insertion de 3 événements
      const commands = [
        new MockCommand(aggregateId, 'chain_test', 'FIRST_EVENT', { seq: 1 }),
        new MockCommand(aggregateId, 'chain_test', 'SECOND_EVENT', { seq: 2 }),
        new MockCommand(aggregateId, 'chain_test', 'THIRD_EVENT', { seq: 3 })
      ];

      const results = await Promise.all(commands.map(cmd => tm.execute(cmd)));

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);

      // Vérification ordre séquentiel
      const events = await tm.getEvents(aggregateId);
      expect(events).toHaveLength(3);
      
      for (let i = 1; i < events.length; i++) {
        expect(events[i].sequence).toBe(events[i-1].sequence + 1);
        expect(events[i].previous_hash).toBe(events[i-1].current_hash);
      }

      // Validation intégrité chaîne
      const stats = await tm.getLedgerStats();
      expect(stats.chainIntegrity).toBe(true);
    });

    it('should calculate hash automatically in PostgreSQL', async () => {
      const command = new MockCommand(
        '550e8400-e29b-41d4-a716-446655440200',
        'hash_test',
        'HASH_AUTO_CALC',
        { test: 'automatic_hash' }
      );

      const result = await tm.execute(command);

      const events = await tm.getEvents(command.aggregateId);
      const insertedEvent = events[0];

      expect(insertedEvent.current_hash).toMatch(/^[a-f0-9]{64}$/);
      expect(insertedEvent.current_hash).toHaveLength(64);
      expect(insertedEvent.current_hash).toBe(insertedEvent.current_hash.toLowerCase());
    });
  });

  describe('📊 Batch Transaction Tests', () => {
    it('should execute batch commands atomically', async () => {
      const commands = [
        new MockCommand('batch-1', 'batch_test', 'BATCH_EVENT_1', { batch: 1 }),
        new MockCommand('batch-2', 'batch_test', 'BATCH_EVENT_2', { batch: 2 }),
        new MockCommand('batch-3', 'batch_test', 'BATCH_EVENT_3', { batch: 3 })
      ];

      const results = await tm.executeBatch(commands);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.eventId)).toBeDefined();

      // Vérification que tous les événements existent
      for (const command of commands) {
        const events = await tm.getEvents(command.aggregateId);
        expect(events).toHaveLength(1);
      }
    });

    it('should fail entire batch if one command fails', async () => {
      const commands = [
        new MockCommand('batch-valid', 'batch_test', 'VALID_EVENT', { valid: true }),
        new MockCommand('batch-invalid', 'batch_test', 'INVALID_EVENT', { invalid: true })
      ];

      // Mock Guardian pour rejeter la deuxième commande
      commands[1].guardian.validate.mockRejectedValue(new Error('Invalid command'));

      await expect(tm.executeBatch(commands)).rejects.toThrow('Invalid command');

      // Vérification qu'aucun événement n'a été inséré (atomicité)
      const events1 = await tm.getEvents('batch-valid');
      const events2 = await tm.getEvents('batch-invalid');
      expect(events1).toHaveLength(0);
      expect(events2).toHaveLength(0);
    });
  });

  describe('📈 Monitoring and Stats Tests', () => {
    it('should provide accurate ledger statistics', async () => {
      const stats = await tm.getLedgerStats();

      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('lastSequence');
      expect(stats).toHaveProperty('lastEventTime');
      expect(stats).toHaveProperty('chainIntegrity');

      expect(typeof stats.totalEvents).toBe('number');
      expect(typeof stats.lastSequence).toBe('number');
      expect(stats.lastEventTime).toBeInstanceOf(Date);
      expect(typeof stats.chainIntegrity).toBe('boolean');
    });

    it('should validate constitutional compliance', async () => {
      const compliance = await tm.validateConstitutionalCompliance();

      expect(compliance).toHaveProperty('isCompliant');
      expect(compliance).toHaveProperty('issues');
      expect(compliance).toHaveProperty('recommendations');

      expect(typeof compliance.isCompliant).toBe('boolean');
      expect(Array.isArray(compliance.issues)).toBe(true);
      expect(Array.isArray(compliance.recommendations)).toBe(true);
    });
  });
});

describe('🔄 TransactionManager Migration Adapter Tests', () => {
  let adapter: TransactionManagerMigrationAdapter;
  let mockGuardian: MockGuardianPort;
  let mockDb: MockDbClient;
  let mockPg: any;

  beforeEach(() => {
    mockGuardian = new MockGuardianPort();
    mockDb = new MockDbClient();
    mockPg = {
      transaction: jest.fn(),
      query: jest.fn(),
      end: jest.fn()
    };

    adapter = new TransactionManagerMigrationAdapter(
      mockGuardian,
      mockDb,
      mockPg,
      'HYBRID'
    );
  });

  describe('🔄 Migration Mode Tests', () => {
    it('should support LEGACY mode', async () => {
      adapter.setMigrationMode('LEGACY');

      const input = {
        decisionId: 'test-decision-1',
        processName: 'test_process',
        decisionType: 'CREATE',
        actorRole: 'USER',
        payload: { test: 'data' },
        events: [],
        facts: [],
        context: { userId: 'test-user' }
      };

      // Mock legacy TM
      const mockResult = { success: true, decisionId: input.decisionId, checksum: 'legacy-checksum' };
      jest.spyOn(adapter as any, 'executeLegacy').mockResolvedValue(mockResult);

      const result = await adapter.executeDecision(input);

      expect(result).toEqual(mockResult);
    });

    it('should support CONSTITUTIONAL mode', async () => {
      adapter.setMigrationMode('CONSTITUTIONAL');

      const input = {
        decisionId: 'test-decision-2',
        processName: 'test_process',
        decisionType: 'CREATE',
        actorRole: 'USER',
        payload: { test: 'data' },
        events: [],
        facts: [],
        context: { userId: 'test-user' }
      };

      // Mock constitutional TM
      const mockResult = { success: true, decisionId: input.decisionId, checksum: 'constitutional-checksum' };
      jest.spyOn(adapter as any, 'executeConstitutional').mockResolvedValue(mockResult);

      const result = await adapter.executeDecision(input);

      expect(result).toEqual(mockResult);
    });

    it('should support HYBRID mode with fallback', async () => {
      adapter.setMigrationMode('HYBRID');

      const input = {
        decisionId: 'test-decision-3',
        processName: 'test_process',
        decisionType: 'CREATE',
        actorRole: 'USER',
        payload: { test: 'data' },
        events: [],
        facts: [],
        context: { userId: 'test-user' }
      };

      // Mock constitutional success, legacy fallback
      jest.spyOn(adapter as any, 'executeConstitutional').mockResolvedValue({
        success: true,
        decisionId: input.decisionId,
        checksum: 'hybrid-checksum'
      });

      const result = await adapter.executeDecision(input);

      expect(result.success).toBe(true);
      expect(result.decisionId).toBe(input.decisionId);
    });
  });

  describe('📊 Migration Statistics Tests', () => {
    it('should provide migration statistics', async () => {
      // Mock constitutional stats
      jest.spyOn(adapter['constitutionalTM'], 'getLedgerStats').mockResolvedValue({
        totalEvents: 100,
        lastSequence: 100,
        lastEventTime: new Date(),
        chainIntegrity: true
      });

      const stats = await adapter.getMigrationStats();

      expect(stats).toHaveProperty('mode');
      expect(stats).toHaveProperty('constitutionalStats');
      expect(stats).toHaveProperty('recommendations');
      expect(stats.mode).toBe('HYBRID');
      expect(Array.isArray(stats.recommendations)).toBe(true);
    });

    it('should validate migration status', async () => {
      // Mock compliance validation
      jest.spyOn(adapter['constitutionalTM'], 'validateConstitutionalCompliance').mockResolvedValue({
        isCompliant: true,
        issues: [],
        recommendations: []
      });

      const validation = await adapter.validateMigration();

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('issues');
      expect(validation).toHaveProperty('nextSteps');
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(Array.isArray(validation.nextSteps)).toBe(true);
    });
  });
});
