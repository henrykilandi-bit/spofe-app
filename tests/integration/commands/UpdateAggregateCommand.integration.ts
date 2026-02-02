/**
 * 🧪 UpdateAggregateCommand Integration Tests
 *
 * Tests d'intégration pour UpdateAggregateCommand.
 * Focus: Collaboration avec Domain + TransactionManager + Guardian.
 *
 * Scénarios testés:
 * ✅ Full flow: Update → Guardian → Append
 * ✅ Append-only principle
 * ✅ Snapshot versioning
 * ✅ Event chaining
 * ✅ Multi-update sequence
 */

import {
  UpdateAggregateCommand,
  UpdateAggregateInput,
} from '../../../../application/commands/UpdateAggregateCommand';
import { DomainError } from '../../../../domain';

/**
 * Mock Guardian
 */
class MockGuardian {
  decisions: Map<string, 'ACCEPT' | 'REJECT'> = new Map();

  decide(processName: string, actorRole: string): 'ACCEPT' | 'REJECT' {
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
 * Mock TransactionManager with Guardian
 */
class MockTransactionManagerWithGuardian {
  calls: Array<any> = [];
  guardian: MockGuardian = new MockGuardian();

  async executeDecision(decision: any): Promise<void> {
    const decision_result = this.guardian.decide(
      decision.processName,
      decision.actorRole
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

describe('UpdateAggregateCommand Integration Tests', () => {
  let mockTxn: MockTransactionManagerWithGuardian;
  let command: UpdateAggregateCommand;
  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    mockTxn = new MockTransactionManagerWithGuardian();
    mockTxn.guardian.allowProcess('UPDATE_AGGREGATE', 'SYSTEM');
    mockTxn.guardian.allowProcess('UPDATE_AGGREGATE', 'ADMIN');
    mockTxn.guardian.allowProcess('UPDATE_AGGREGATE', 'USER');
    command = new UpdateAggregateCommand(mockTxn);
  });

  // ─────────────────────────────────────────
  // Suite 1: Full Flow
  // ─────────────────────────────────────────

  describe('Suite 1: Full Flow', () => {
    it('updates aggregate with Guardian acceptance', async () => {
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].guardianDecision).toBe('ACCEPT');
    });

    it('stops execution if Guardian rejects', async () => {
      mockTxn.guardian.rejectProcess('UPDATE_AGGREGATE', 'USER');

      try {
        await command.execute({
          aggregateId: uuid,
          changes: { name: 'Updated' },
          actorRole: 'USER',
        });

        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Guardian rejected');
      }

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('completes successfully with valid input and Guardian approval', async () => {
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Jane', email: 'jane@example.com' },
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls).toHaveLength(1);
      const decision = mockTxn.calls[0];

      expect(decision.decisionType).toBe('UPDATE');
      expect(decision.events).toHaveLength(1);
      expect(decision.facts).toHaveLength(1);
      expect(decision.facts[0].factType).toBe('SNAPSHOT');
    });
  });

  // ─────────────────────────────────────────
  // Suite 2: Append-Only Principle
  // ─────────────────────────────────────────

  describe('Suite 2: Append-Only Principle', () => {
    it('each update creates independent event + snapshot', async () => {
      // First update
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'First' },
        actorRole: 'SYSTEM',
      });

      const firstEvent = mockTxn.calls[0].events[0];
      const firstSnapshot = mockTxn.calls[0].facts[0];

      mockTxn.reset();

      // Second update
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Second' },
        actorRole: 'SYSTEM',
      });

      const secondEvent = mockTxn.calls[0].events[0];
      const secondSnapshot = mockTxn.calls[0].facts[0];

      // Events are independent
      expect(firstEvent.eventId).not.toBe(secondEvent.eventId);
      expect(firstEvent.payload.changes).toEqual({ name: 'First' });
      expect(secondEvent.payload.changes).toEqual({ name: 'Second' });

      // Snapshots are independent
      expect(firstSnapshot.factId).not.toBe(secondSnapshot.factId);
      expect(firstSnapshot.payload.data).toEqual({ name: 'First' });
      expect(secondSnapshot.payload.data).toEqual({ name: 'Second' });
    });

    it('updates do not delete previous events', async () => {
      // Simulate update sequence
      // In real DB: first update INSERT event1, second update INSERT event2
      // No UPDATE SQL that overwrites event1

      await command.execute({
        aggregateId: uuid,
        changes: { name: 'First' },
        actorRole: 'SYSTEM',
      });

      const firstDecision = mockTxn.calls[0];

      mockTxn.reset();

      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Second' },
        actorRole: 'SYSTEM',
      });

      const secondDecision = mockTxn.calls[0];

      // Both decisions should be recorded (in real DB: both INSERTs)
      expect(firstDecision).toBeDefined();
      expect(secondDecision).toBeDefined();
      expect(firstDecision.events[0].eventId).not.toBe(
        secondDecision.events[0].eventId
      );
    });
  });

  // ─────────────────────────────────────────
  // Suite 3: Snapshot Versioning
  // ─────────────────────────────────────────

  describe('Suite 3: Snapshot Versioning', () => {
    it('each update creates new snapshot version', async () => {
      const updates = [
        { name: 'Alice', status: 'NEW' },
        { name: 'Alice', status: 'ACTIVE' },
        { name: 'Bob', status: 'ACTIVE' },
      ];

      for (const changes of updates) {
        await command.execute({
          aggregateId: uuid,
          changes,
          actorRole: 'SYSTEM',
        });
      }

      expect(mockTxn.calls).toHaveLength(3);

      // Each call has a different snapshot
      mockTxn.calls.forEach((call, index) => {
        const snapshot = call.facts[0];
        expect(snapshot.payload.data).toEqual(updates[index]);
      });
    });

    it('snapshot data is independent (no merging)', async () => {
      // First update: set name only
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Alice' },
        actorRole: 'SYSTEM',
      });

      const snap1 = mockTxn.calls[0].facts[0];
      expect(snap1.payload.data).toEqual({ name: 'Alice' });

      mockTxn.reset();

      // Second update: set email only
      // Note: snapshot contains ONLY what's in changes
      await command.execute({
        aggregateId: uuid,
        changes: { email: 'alice@example.com' },
        actorRole: 'SYSTEM',
      });

      const snap2 = mockTxn.calls[0].facts[0];
      expect(snap2.payload.data).toEqual({ email: 'alice@example.com' });

      // snap2 doesn't magically contain snap1's name
      // (Application layer would need to merge if full state tracking needed)
    });
  });

  // ─────────────────────────────────────────
  // Suite 4: Event Chaining
  // ─────────────────────────────────────────

  describe('Suite 4: Event Chaining', () => {
    it('multiple events form an append-only chain', async () => {
      // Simulate a sequence of updates
      const updates = [
        { status: 'PENDING' },
        { status: 'IN_PROGRESS' },
        { status: 'COMPLETED' },
      ];

      for (const changes of updates) {
        await command.execute({
          aggregateId: uuid,
          changes,
          actorRole: 'SYSTEM',
        });
      }

      expect(mockTxn.calls).toHaveLength(3);

      // All events are AggregateUpdated
      mockTxn.calls.forEach((call, index) => {
        expect(call.events[0].payload.type).toBe('AggregateUpdated');
        expect(call.events[0].payload.changes).toEqual(updates[index]);
      });

      // Event IDs are all unique
      const eventIds = mockTxn.calls.map((c) => c.events[0].eventId);
      const uniqueIds = new Set(eventIds);
      expect(uniqueIds.size).toBe(3);
    });
  });

  // ─────────────────────────────────────────
  // Suite 5: Role-Based Access
  // ─────────────────────────────────────────

  describe('Suite 5: Role-Based Access', () => {
    it('ADMIN role can update', async () => {
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Updated' },
        actorRole: 'ADMIN',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].actorRole).toBe('ADMIN');
    });

    it('SYSTEM role can update', async () => {
      await command.execute({
        aggregateId: uuid,
        changes: { name: 'Updated' },
        actorRole: 'SYSTEM',
      });

      expect(mockTxn.calls).toHaveLength(1);
      expect(mockTxn.calls[0].actorRole).toBe('SYSTEM');
    });

    it('USER role blocked by Guardian', async () => {
      mockTxn.guardian.rejectProcess('UPDATE_AGGREGATE', 'USER');

      try {
        await command.execute({
          aggregateId: uuid,
          changes: { name: 'Updated' },
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
    it('decision includes complete update context', async () => {
      const changes = { name: 'Updated', status: 'ACTIVE' };

      await command.execute({
        aggregateId: uuid,
        changes,
        actorRole: 'ADMIN',
      });

      const decision = mockTxn.calls[0];

      expect(decision.context).toBeDefined();
      expect(decision.context.aggregateId).toBe(uuid.toLowerCase());
      expect(decision.context.event).toBe('AggregateUpdated');
      expect(decision.context.timestamp).toBeDefined();
    });

    it('payload includes changes for audit', async () => {
      const changes = { name: 'Jane', email: 'jane@example.com' };

      await command.execute({
        aggregateId: uuid,
        changes,
        actorRole: 'SYSTEM',
      });

      const payload = mockTxn.calls[0].payload;
      expect(payload.changes).toEqual(changes);
    });
  });

  // ─────────────────────────────────────────
  // Suite 7: Error Propagation
  // ─────────────────────────────────────────

  describe('Suite 7: Error Propagation', () => {
    it('DomainError stops execution before Guardian', async () => {
      try {
        await command.execute({
          aggregateId: 'invalid-uuid',
          changes: { name: 'Updated' },
          actorRole: 'SYSTEM',
        });

        fail('Should have thrown DomainError');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
      }

      expect(mockTxn.calls).toHaveLength(0);
    });

    it('Guardian error prevents update recording', async () => {
      mockTxn.guardian.rejectProcess('UPDATE_AGGREGATE', 'ADMIN');

      try {
        await command.execute({
          aggregateId: uuid,
          changes: { name: 'Updated' },
          actorRole: 'ADMIN',
        });

        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Guardian rejected');
      }

      expect(mockTxn.calls).toHaveLength(0);
    });
  });
});
