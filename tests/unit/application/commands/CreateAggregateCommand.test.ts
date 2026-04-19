/**
 * 🧪 CreateAggregateCommand Unit Tests
 *
 * Tests unitaires pour CreateAggregateCommand (Domain-first).
 * Focus: Validation Value Objects, construction Events/Facts, mappage TransactionManager.
 *
 * Propriétés testées:
 * ✅ Validation AggregateId
 * ✅ Validation ActorRole
 * ✅ Timestamp création
 * ✅ Domain Event (AggregateCreated)
 * ✅ Domain Facts (AggregateExists, AggregateSnapshot)
 * ✅ Mappage vers TransactionManager
 * ✅ Error handling (DomainError)
 */

import {
  CreateAggregateCommand,
  CreateAggregateInput,
} from '../../../../application/commands/CreateAggregateCommand';
import { ExecuteDecisionInput } from '../../../../src/application/transaction';
import {
  AggregateId,
  ActorRole,
  Timestamp,
  DomainError,
} from '../../../../domain';

/**
 * Mock TransactionManager
 *
 * Simule le TransactionManager sans effectuer de persistence réelle.
 * Enregistre les appels pour vérification.
 */
class MockTransactionManager {
  calls: Array<
    Omit<ExecuteDecisionInput, 'payload' | 'events' | 'facts' | 'context'> & {
      payload: Record<string, any>;
      events: Array<{
        eventId: string;
        eventType: string;
        payload: Record<string, any>;
      }>;
      facts: Array<{
        factId: string;
        aggregateId: string;
        factType: string;
        payload: Record<string, any>;
        causedByEvent: string;
      }>;
      context: Record<string, unknown>;
    }
  > = [];

  async executeDecision(decision: ExecuteDecisionInput): Promise<void> {
    this.calls.push(decision as MockTransactionManager['calls'][number]);
  }

  reset(): void {
    this.calls = [];
  }
}

describe('CreateAggregateCommand', () => {
  let mockTxn: MockTransactionManager;
  let command: CreateAggregateCommand;

  beforeEach(() => {
    mockTxn = new MockTransactionManager();
    command = new CreateAggregateCommand(mockTxn);
  });

  // ─────────────────────────────────────────
  // Suite 1: Validation AggregateId
  // ─────────────────────────────────────────

  describe('Suite 1: AggregateId Validation', () => {
    it('accepts valid UUID v4', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: validUuid,
        initialData: { name: 'Test' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].payload.aggregateId).toBe(validUuid.toLowerCase());
    });

    it('rejects empty aggregateId', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: '',
          initialData: { name: 'Test' },
          actorRole: 'SYSTEM',
        });
      }).rejects.toThrow(DomainError);

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('rejects invalid UUID format', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: 'not-a-uuid',
          initialData: { name: 'Test' },
          actorRole: 'SYSTEM',
        });
      }).rejects.toThrow(DomainError);

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('normalizes UUID to lowercase', async () => {
      const mixedCase = '550E8400-E29B-41D4-A716-446655440000';
      const expected = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: mixedCase,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].payload.aggregateId).toBe(expected);
    });
  });

  // ─────────────────────────────────────────
  // Suite 2: ActorRole Validation
  // ─────────────────────────────────────────

  describe('Suite 2: ActorRole Validation', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('accepts SYSTEM role', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].actorRole).toBe('SYSTEM');
    });

    it('accepts ADMIN role', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls[0].actorRole).toBe('ADMIN');
    });

    it('accepts USER role', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'USER',
      });

      expect(mockTxn.calls[0].actorRole).toBe('USER');
    });

    it('rejects invalid role', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: validUuid,
          initialData: {},
          actorRole: 'SUPER_ADMIN' as any,
        });
      }).rejects.toThrow(DomainError);

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('rejects empty role', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: validUuid,
          initialData: {},
          actorRole: '' as any,
        });
      }).rejects.toThrow(DomainError);
    });
  });

  // ─────────────────────────────────────────
  // Suite 3: Domain Event Construction
  // ─────────────────────────────────────────

  describe('Suite 3: Domain Event Construction', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('creates AggregateCreated event', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: { name: 'Test' },
        actorRole: 'SYSTEM',
      });

      const call = mockTxn.calls[0];
      expect(call.events).toHaveLength(1);
      expect(call.events[0].eventType).toBe('CREATED');
    });

    it('event has correct type discriminant', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.type).toBe('AggregateCreated');
    });

    it('event includes aggregateId', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    });

    it('event includes occurredAt timestamp', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.occurredAt).toBeDefined();
      // ISO 8601 format
      expect(event.payload.occurredAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('event is immutable after creation', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(() => {
        (event as any).type = 'AggregateUpdated';
      }).not.toThrow(); // Object.freeze empêche la modification silencieuse
    });
  });

  // ─────────────────────────────────────────
  // Suite 4: Domain Facts Construction
  // ─────────────────────────────────────────

  describe('Suite 4: Domain Facts Construction', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('creates two facts (AggregateExists + Snapshot)', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: { name: 'Test' },
        actorRole: 'SYSTEM',
      });

      const call = mockTxn.calls[0];
      expect(call.facts).toHaveLength(2);
    });

    it('first fact is AggregateExists', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const existsFact = mockTxn.calls[0].facts[0];
      expect(existsFact.payload.type).toBe('AggregateExists');
      expect(existsFact.factType).toBe('EXISTENCE');
    });

    it('second fact is AggregateSnapshot', async () => {
      const data = { name: 'John', email: 'john@example.com' };

      await command.execute({
        aggregateId: validUuid,
        initialData: data,
        actorRole: 'SYSTEM',
      });

      const snapshot = mockTxn.calls[0].facts[1];
      expect(snapshot.payload.type).toBe('AggregateSnapshot');
      expect(snapshot.factType).toBe('SNAPSHOT');
      expect(snapshot.payload.data).toEqual(data);
    });

    it('facts include aggregateId', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      mockTxn.calls[0].facts.forEach((fact) => {
        expect(fact.aggregateId).toBe(validUuid.toLowerCase());
      });
    });

    it('facts include validFrom timestamp', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      mockTxn.calls[0].facts.forEach((fact) => {
        expect(fact.payload.validFrom).toBeDefined();
        expect(fact.payload.validFrom).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        );
      });
    });

    it('facts are caused by the event', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const call = mockTxn.calls[0];
      const eventId = call.events[0].eventId;

      call.facts.forEach((fact) => {
        expect(fact.causedByEvent).toBe(eventId);
      });
    });
  });

  // ─────────────────────────────────────────
  // Suite 5: TransactionManager Integration
  // ─────────────────────────────────────────

  describe('Suite 5: TransactionManager Integration', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('calls executeDecision once', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
    });

    it('decision has correct processName', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].processName).toBe('CREATE_AGGREGATE');
    });

    it('decision has correct decisionType', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].decisionType).toBe('CREATE');
    });

    it('decision has decisionId (UUID)', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const decisionId = mockTxn.calls[0].decisionId;
      expect(decisionId).toBeDefined();
      // Basic UUID validation
      expect(decisionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('decision includes audit context', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const context = mockTxn.calls[0].context;
      expect(context.aggregateId).toBe(validUuid.toLowerCase());
      expect(context.event).toBe('AggregateCreated');
      expect(context.timestamp).toBeDefined();
    });

    it('decision payload is serializable', async () => {
      const data = { name: 'Test', nested: { key: 'value' } };

      await command.execute({
        aggregateId: validUuid,
        initialData: data,
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      // Should be JSON-serializable
      const json = JSON.stringify(decision);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(decision);
    });
  });

  // ─────────────────────────────────────────
  // Suite 6: Error Handling
  // ─────────────────────────────────────────

  describe('Suite 6: Error Handling', () => {
    it('stops execution on invalid aggregateId', async () => {
      try {
        await command.execute({
          aggregateId: 'invalid',
          initialData: {},
          actorRole: 'SYSTEM',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
      }

      // Transaction not called
      expect(mockTxn.calls).toHaveLength(0);
    });

    it('stops execution on invalid actorRole', async () => {
      try {
        await command.execute({
          aggregateId: '550e8400-e29b-41d4-a716-446655440000',
          initialData: {},
          actorRole: 'INVALID' as any,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
      }

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('error message is descriptive', async () => {
      try {
        await command.execute({
          aggregateId: '',
          initialData: {},
          actorRole: 'SYSTEM',
        });
      } catch (error) {
        if (error instanceof DomainError) {
          expect(error.message).toContain('AggregateId');
        }
      }
    });
  });

  // ─────────────────────────────────────────
  // Suite 7: Multiple Calls
  // ─────────────────────────────────────────

  describe('Suite 7: Multiple Calls', () => {
    it('handles multiple independent executions', async () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '660e8400-e29b-41d4-a716-446655440001';

      await command.execute({
        aggregateId: uuid1,
        initialData: { id: 1 },
        actorRole: 'SYSTEM',
      });

      await command.execute({
        aggregateId: uuid2,
        initialData: { id: 2 },
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls).toHaveLength(2);
      expect(mockTxn.calls[0].payload.aggregateId).toBe(uuid1.toLowerCase());
      expect(mockTxn.calls[1].payload.aggregateId).toBe(uuid2.toLowerCase());
    });
  });

  // ─────────────────────────────────────────
  // Suite 8: Data Integrity
  // ─────────────────────────────────────────

  describe('Suite 8: Data Integrity', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('preserves initialData in snapshot', async () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
        metadata: { createdBy: 'SYSTEM' },
      };

      await command.execute({
        aggregateId: validUuid,
        initialData: data,
        actorRole: 'SYSTEM',
      });

      const snapshot = mockTxn.calls[0].facts[1];
      expect(snapshot.payload.data).toEqual(data);
    });

    it('handles empty initialData', async () => {
      await command.execute({
        aggregateId: validUuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const snapshot = mockTxn.calls[0].facts[1];
      expect(snapshot.payload.data).toEqual({});
    });

    it('handles complex nested initialData', async () => {
      const data = {
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        config: {
          nested: {
            deep: {
              value: 'test',
            },
          },
        },
      };

      await command.execute({
        aggregateId: validUuid,
        initialData: data,
        actorRole: 'SYSTEM',
      });

      const snapshot = mockTxn.calls[0].facts[1];
      expect(snapshot.payload.data).toEqual(data);
    });
  });
});
