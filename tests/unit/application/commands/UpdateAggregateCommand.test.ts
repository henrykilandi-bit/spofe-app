/**
 * 🧪 UpdateAggregateCommand Unit Tests
 *
 * Tests unitaires pour UpdateAggregateCommand (Domain-first, append-only).
 * Focus: Validation Value Objects, construction Append-Only Event, Snapshot génération.
 *
 * Propriétés testées:
 * ✅ Validation AggregateId (existant)
 * ✅ Validation ActorRole
 * ✅ Timestamp création
 * ✅ Domain Event (AggregateUpdated)
 * ✅ Domain Fact (new AggregateSnapshot)
 * ✅ Append-only principle
 * ✅ Mappage vers TransactionManager
 * ✅ Error handling
 */

import {
  UpdateAggregateCommand,
  UpdateAggregateInput,
} from '../../../../application/commands/UpdateAggregateCommand';
import { ExecuteDecisionInput } from '../../../../src/application/transaction';
import {
  AggregateId,
  ActorRole,
  Timestamp,
  DomainError,
} from '../../../../domain';

/**
 * Mock TransactionManager
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

describe('UpdateAggregateCommand', () => {
  let mockTxn: MockTransactionManager;
  let command: UpdateAggregateCommand;

  beforeEach(() => {
    mockTxn = new MockTransactionManager();
    command = new UpdateAggregateCommand(mockTxn);
  });

  // ─────────────────────────────────────────
  // Suite 1: AggregateId Validation
  // ─────────────────────────────────────────

  describe('Suite 1: AggregateId Validation', () => {
    it('accepts valid UUID v4', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].payload.aggregateId).toBe(validUuid.toLowerCase());
    });

    it('rejects empty aggregateId', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: '',
          changes: { name: 'Updated' },
          actorRole: 'SYSTEM',
        });
      }).rejects.toThrow(DomainError);

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('rejects invalid UUID format', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: 'not-a-uuid',
          changes: { name: 'Updated' },
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
        changes: { name: 'Updated' },
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
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].actorRole).toBe('SYSTEM');
    });

    it('accepts ADMIN role', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls[0].actorRole).toBe('ADMIN');
    });

    it('accepts USER role', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'USER',
      });

      expect(mockTxn.calls[0].actorRole).toBe('USER');
    });

    it('rejects invalid role', async () => {
      expect(async () => {
        await command.execute({
          aggregateId: validUuid,
          changes: { status: 'UPDATED' },
          actorRole: 'SUPER_ADMIN' as any,
        });
      }).rejects.toThrow(DomainError);

      expect(mockTxn.calls).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────
  // Suite 3: Domain Event Construction
  // ─────────────────────────────────────────

  describe('Suite 3: Domain Event Construction', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('creates AggregateUpdated event', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated Name' },
        actorRole: 'SYSTEM',
      });

      const call = mockTxn.calls[0];
      expect(call.events).toHaveLength(1);
      expect(call.events[0].eventType).toBe('UPDATED');
    });

    it('event has correct type discriminant', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'ACTIVE' },
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.type).toBe('AggregateUpdated');
    });

    it('event includes aggregateId', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    });

    it('event includes changes', async () => {
      const changes = { name: 'Jane', email: 'jane@example.com' };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual(changes);
    });

    it('event includes occurredAt timestamp', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.occurredAt).toBeDefined();
      expect(event.payload.occurredAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  // ─────────────────────────────────────────
  // Suite 4: Append-Only Principle
  // ─────────────────────────────────────────

  describe('Suite 4: Append-Only Principle', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('creates exactly one fact (new snapshot)', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      const call = mockTxn.calls[0];
      expect(call.facts).toHaveLength(1);
    });

    it('fact is a SNAPSHOT', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      const fact = mockTxn.calls[0].facts[0];
      expect(fact.factType).toBe('SNAPSHOT');
      expect(fact.payload.type).toBe('AggregateSnapshot');
    });

    it('snapshot contains the new data (changes)', async () => {
      const changes = { name: 'Jane', status: 'ACTIVE' };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const snapshot = mockTxn.calls[0].facts[0];
      expect(snapshot.payload.data).toEqual(changes);
    });

    it('does not delete previous snapshot (append-only)', async () => {
      // Calling update twice
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'First Update' },
        actorRole: 'SYSTEM',
      });

      mockTxn.reset();

      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Second Update' },
        actorRole: 'SYSTEM',
      });

      // Second update should be independent
      // DB will INSERT new event + new fact
      // Old event/fact remain in DB
      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].events[0].eventType).toBe('UPDATED');
    });

    it('new snapshot is independent of previous', async () => {
      const changes1 = { name: 'Alice', email: 'alice@example.com' };
      const changes2 = { name: 'Bob' }; // Note: not full data

      // First update
      await command.execute({
        aggregateId: validUuid,
        changes: changes1,
        actorRole: 'SYSTEM',
      });

      const snapshot1 = mockTxn.calls[0].facts[0];

      // Second update
      mockTxn.reset();
      await command.execute({
        aggregateId: validUuid,
        changes: changes2,
        actorRole: 'ADMIN',
      });

      const snapshot2 = mockTxn.calls[0].facts[0];

      // Each snapshot is independent
      expect(snapshot1.payload.data).toEqual(changes1);
      expect(snapshot2.payload.data).toEqual(changes2);
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
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
    });

    it('decision has correct processName', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].processName).toBe('UPDATE_AGGREGATE');
    });

    it('decision has correct decisionType', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls[0].decisionType).toBe('UPDATE');
    });

    it('decision has decisionId (UUID)', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      const decisionId = mockTxn.calls[0].decisionId;
      expect(decisionId).toBeDefined();
      expect(decisionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('payload includes aggregateId and changes', async () => {
      const changes = { name: 'Updated', email: 'test@example.com' };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const payload = mockTxn.calls[0].payload;
      expect(payload.aggregateId).toBe(validUuid.toLowerCase());
      expect(payload.changes).toEqual(changes);
    });

    it('context includes audit information', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'ADMIN',
      });

      const context = mockTxn.calls[0].context;
      expect(context.aggregateId).toBe(validUuid.toLowerCase());
      expect(context.event).toBe('AggregateUpdated');
      expect(context.timestamp).toBeDefined();
    });

    it('decision payload is JSON-serializable', async () => {
      const changes = { nested: { key: 'value' }, array: [1, 2, 3] };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      const json = JSON.stringify(decision);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(decision);
    });
  });

  // ─────────────────────────────────────────
  // Suite 6: Changes Handling
  // ─────────────────────────────────────────

  describe('Suite 6: Changes Handling', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('handles single field change', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual({ name: 'Updated' });
    });

    it('handles multiple field changes', async () => {
      const changes = {
        name: 'Updated',
        email: 'new@example.com',
        status: 'ACTIVE',
      };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual(changes);
    });

    it('handles nested object changes', async () => {
      const changes = {
        config: {
          level1: {
            level2: { value: 'deep' },
          },
        },
      };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual(changes);
    });

    it('handles array changes', async () => {
      const changes = {
        items: [{ id: 1 }, { id: 2 }],
      };

      await command.execute({
        aggregateId: validUuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual(changes);
    });

    it('handles empty changes object', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: {},
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      expect(event.payload.changes).toEqual({});
    });
  });

  // ─────────────────────────────────────────
  // Suite 7: Error Handling
  // ─────────────────────────────────────────

  describe('Suite 7: Error Handling', () => {
    it('stops execution on invalid aggregateId', async () => {
      try {
        await command.execute({
          aggregateId: 'invalid',
          changes: { name: 'Updated' },
          actorRole: 'SYSTEM',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
      }

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('stops execution on invalid actorRole', async () => {
      try {
        await command.execute({
          aggregateId: '550e8400-e29b-41d4-a716-446655440000',
          changes: { name: 'Updated' },
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
          changes: { name: 'Updated' },
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
  // Suite 8: Timestamp Consistency
  // ─────────────────────────────────────────

  describe('Suite 8: Timestamp Consistency', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('event and fact have same validFrom/occurredAt', async () => {
      await command.execute({
        aggregateId: validUuid,
        changes: { status: 'UPDATED' },
        actorRole: 'SYSTEM',
      });

      const event = mockTxn.calls[0].events[0];
      const fact = mockTxn.calls[0].facts[0];

      // Should be very close (same Timestamp.now() call in command)
      expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    });
  });
});
