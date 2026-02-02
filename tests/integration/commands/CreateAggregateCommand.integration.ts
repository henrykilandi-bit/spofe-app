/**
 * 🧪 CreateAggregateCommand Integration Tests
 *
 * Tests d'intégration pour CreateAggregateCommand.
 * Focus: Collaboration avec Domain + TransactionManager + Guardian (mocked).
 *
 * Scénarios testés:
 * ✅ Full flow: Input → Command → TransactionManager
 * ✅ Guardian decision propagation
 * ✅ Multi-aggregate creation (sequence)
 * ✅ Event ordering
 * ✅ Fact causality
 */

import {
  CreateAggregateCommand,
  CreateAggregateInput,
} from '../../../../application/commands/CreateAggregateCommand';
import {
  AggregateId,
  ActorRole,
  Timestamp,
  DomainError,
} from '../../../../domain';

/**
 * Mock Guardian
 *
 * Simule les décisions du Guardian.
 */
class MockGuardian {
  decisions: Map<string, 'ACCEPT' | 'REJECT'> = new Map();

  decide(
    processName: string,
    actorRole: string,
    payload: Record<string, unknown>
  ): 'ACCEPT' | 'REJECT' {
    return this.decisions.get(`${processName}:${actorRole}`) || 'ACCEPT';
  }

  allowProcess(processName: string, actorRole: string): void {
    this.decisions.set(`${processName}:${actorRole}`, 'ACCEPT');
  }

  rejectProcess(processName: string, actorRole: string): void {
    this.decisions.set(`${processName}:${actorRole}`, 'REJECT');
  }
}

/**
 * Mock TransactionManager with Guardian integration
 */
class MockTransactionManagerWithGuardian {
  calls: Array<any> = [];
  guardian: MockGuardian = new MockGuardian();

  async executeDecision(decision: any): Promise<void> {
    const decision_result = this.guardian.decide(
      decision.processName,
      decision.actorRole,
      decision.payload
    );

    if (decision_result === 'REJECT') {
      throw new Error(
        `Guardian rejected: ${decision.processName} by ${decision.actorRole}`
      );
    }

    this.calls.push({
      ...decision,
      guardianDecision: decision_result,
    });
  }

  reset(): void {
    this.calls = [];
  }
}

describe('CreateAggregateCommand Integration Tests', () => {
  let mockTxn: MockTransactionManagerWithGuardian;
  let command: CreateAggregateCommand;

  beforeEach(() => {
    mockTxn = new MockTransactionManagerWithGuardian();
    mockTxn.guardian.allowProcess('CREATE_AGGREGATE', 'SYSTEM');
    mockTxn.guardian.allowProcess('CREATE_AGGREGATE', 'ADMIN');
    mockTxn.guardian.allowProcess('CREATE_AGGREGATE', 'USER');
    command = new CreateAggregateCommand(mockTxn);
  });

  // ─────────────────────────────────────────
  // Suite 1: Full Flow
  // ─────────────────────────────────────────

  describe('Suite 1: Full Flow', () => {
    it('creates aggregate with Guardian acceptance', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: { name: 'Test' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].guardianDecision).toBe('ACCEPT');
    });

    it('stops execution if Guardian rejects', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      // Guardian will reject
      mockTxn.guardian.rejectProcess('CREATE_AGGREGATE', 'USER');

      try {
        await command.execute({
          aggregateId: uuid,
          initialData: { name: 'Test' },
          actorRole: 'USER',
        });

        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Guardian rejected');
      }

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('completes successfully with valid input and Guardian approval', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const data = { name: 'Alice', email: 'alice@example.com' };

      await command.execute({
        aggregateId: uuid,
        initialData: data,
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls).toHaveLength(1);
      const decision = mockTxn.calls[0];

      expect(decision.decisionType).toBe('CREATE');
      expect(decision.events).toHaveLength(1);
      expect(decision.facts).toHaveLength(2);
      expect(decision.guardianDecision).toBe('ACCEPT');
    });
  });

  // ─────────────────────────────────────────
  // Suite 2: Event Ordering
  // ─────────────────────────────────────────

  describe('Suite 2: Event Ordering', () => {
    it('events are in correct order', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      const events = decision.events;

      // Should have 1 CREATE event
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('CREATED');
      expect(events[0].payload.type).toBe('AggregateCreated');
    });

    it('facts are properly ordered (Existence → Snapshot)', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: { status: 'NEW' },
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      const facts = decision.facts;

      expect(facts).toHaveLength(2);
      expect(facts[0].payload.type).toBe('AggregateExists');
      expect(facts[1].payload.type).toBe('AggregateSnapshot');
    });
  });

  // ─────────────────────────────────────────
  // Suite 3: Fact Causality
  // ─────────────────────────────────────────

  describe('Suite 3: Fact Causality', () => {
    it('all facts are caused by the created event', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      const eventId = decision.events[0].eventId;
      const facts = decision.facts;

      facts.forEach((fact) => {
        expect(fact.causedByEvent).toBe(eventId);
      });
    });

    it('fact IDs are unique', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const decision = mockTxn.calls[0];
      const factIds = decision.facts.map((f) => f.factId);

      // All factIds should be unique
      const uniqueFacts = new Set(factIds);
      expect(uniqueFacts.size).toBe(factIds.length);
    });
  });

  // ─────────────────────────────────────────
  // Suite 4: Multi-Aggregate Sequence
  // ─────────────────────────────────────────

  describe('Suite 4: Multi-Aggregate Sequence', () => {
    it('creates multiple aggregates independently', async () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '660e8400-e29b-41d4-a716-446655440001';
      const uuid3 = '770e8400-e29b-41d4-a716-446655440002';

      await command.execute({
        aggregateId: uuid1,
        initialData: { name: 'First' },
        actorRole: 'SYSTEM',
      });

      await command.execute({
        aggregateId: uuid2,
        initialData: { name: 'Second' },
        actorRole: 'ADMIN',
      });

      await command.execute({
        aggregateId: uuid3,
        initialData: { name: 'Third' },
        actorRole: 'USER',
      });

      expect(mockTxn.calls).toHaveLength(3);

      // Each decision is independent
      mockTxn.calls.forEach((call, index) => {
        expect(call.decisionType).toBe('CREATE');
        expect(call.events).toHaveLength(1);
        expect(call.facts).toHaveLength(2);
      });

      // Verify each aggregate has correct ID
      expect(mockTxn.calls[0].payload.aggregateId).toBe(uuid1.toLowerCase());
      expect(mockTxn.calls[1].payload.aggregateId).toBe(uuid2.toLowerCase());
      expect(mockTxn.calls[2].payload.aggregateId).toBe(uuid3.toLowerCase());
    });

    it('each aggregate has unique decision IDs', async () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '660e8400-e29b-41d4-a716-446655440001';

      await command.execute({
        aggregateId: uuid1,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      await command.execute({
        aggregateId: uuid2,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const decisionIds = mockTxn.calls.map((c) => c.decisionId);
      const uniqueIds = new Set(decisionIds);

      expect(uniqueIds.size).toBe(2);
    });
  });

  // ─────────────────────────────────────────
  // Suite 5: Role-Based Access
  // ─────────────────────────────────────────

  describe('Suite 5: Role-Based Access', () => {
    it('SYSTEM role can create', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].actorRole).toBe('SYSTEM');
    });

    it('ADMIN role can create', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].actorRole).toBe('ADMIN');
    });

    it('USER role can create (unless Guardian denies)', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      // Allow USER initially
      mockTxn.guardian.allowProcess('CREATE_AGGREGATE', 'USER');

      await command.execute({
        aggregateId: uuid,
        initialData: {},
        actorRole: 'USER',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].actorRole).toBe('USER');
    });

    it('USER role blocked by Guardian', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      mockTxn.guardian.rejectProcess('CREATE_AGGREGATE', 'USER');

      try {
        await command.execute({
          aggregateId: uuid,
          initialData: {},
          actorRole: 'USER',
        });

        fail('Should have been rejected');
      } catch (error) {
        expect((error as Error).message).toContain('Guardian rejected');
      }

      expect(mockTxn.calls).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────
  // Suite 6: Audit Trail
  // ─────────────────────────────────────────

  describe('Suite 6: Audit Trail', () => {
    it('decision includes complete audit context', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      await command.execute({
        aggregateId: uuid,
        initialData: { name: 'Test' },
        actorRole: 'ADMIN',
      });

      const decision = mockTxn.calls[0];

      expect(decision.context).toBeDefined();
      expect(decision.context.aggregateId).toBe(uuid.toLowerCase());
      expect(decision.context.event).toBe('AggregateCreated');
      expect(decision.context.timestamp).toBeDefined();
    });

    it('all decisions are timestamped', async () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '660e8400-e29b-41d4-a716-446655440001';

      await command.execute({
        aggregateId: uuid1,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10));

      await command.execute({
        aggregateId: uuid2,
        initialData: {},
        actorRole: 'SYSTEM',
      });

      const ts1 = new Date(mockTxn.calls[0].context.timestamp);
      const ts2 = new Date(mockTxn.calls[1].context.timestamp);

      expect(ts2.getTime()).toBeGreaterThanOrEqual(ts1.getTime());
    });
  });

  // ─────────────────────────────────────────
  // Suite 7: Error Propagation
  // ─────────────────────────────────────────

  describe('Suite 7: Error Propagation', () => {
    it('DomainError stops execution before Guardian', async () => {
      const uuid = 'invalid-uuid';

      try {
        await command.execute({
          aggregateId: uuid,
          initialData: {},
          actorRole: 'SYSTEM',
        });

        fail('Should have thrown DomainError');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
      }

      // Guardian was never called
      expect(mockTxn.calls).toHaveLength(0);
    });

    it('Guardian error prevents persistence', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      mockTxn.guardian.rejectProcess('CREATE_AGGREGATE', 'SYSTEM');

      try {
        await command.execute({
          aggregateId: uuid,
          initialData: {},
          actorRole: 'SYSTEM',
        });

        fail('Should have thrown Guardian error');
      } catch (error) {
        expect((error as Error).message).toContain('Guardian');
      }

      // No call recorded (Guardian rejected)
      expect(mockTxn.calls).toHaveLength(0);
    });
  });
});
