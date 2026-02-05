/**
 * Repository: DecisionRecord (Write-Side)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * ⚠️ WRITE-SIDE ONLY
 * - Gère les décisions terminales (VALIDATE, REJECT)
 * - Invariant COUT-DEC-02: Decision is terminal
 */

import type { Pool } from 'pg';
import type { 
  DecisionRecorded,
  CostStructureEvent,
} from '../../domain/events/index.js';
import type { DecisionRecordState } from '../../domain/guardian/cost-structure.guardian.js';

// ─────────────────────────────────────────────────────────────
// Repository Interface
// ─────────────────────────────────────────────────────────────

export interface DecisionRecordRepository {
  findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null>;
  saveEvents(events: CostStructureEvent[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// PostgreSQL Implementation
// ─────────────────────────────────────────────────────────────

export class PostgresDecisionRecordRepository implements DecisionRecordRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Find latest decision for project (for terminal check)
   */
  async findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          decision_id,
          project_id,
          tenant_id,
          decision,
          decided_by,
          decided_at
         FROM coutflex.decision_records 
         WHERE tenant_id = $1 AND project_id = $2
         ORDER BY decided_at DESC
         LIMIT 1
         FOR UPDATE`,
        [tenantId, projectId],
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        decisionId: row.decision_id,
        projectId: row.project_id,
        tenantId: row.tenant_id,
        decision: row.decision,
        decidedBy: row.decided_by,
        decidedAt: row.decided_at,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Save events — Filter for DecisionRecorded only
   */
  async saveEvents(events: CostStructureEvent[]): Promise<void> {
    const decisionEvents = events.filter(e => e.eventType === 'DecisionRecorded') as DecisionRecorded[];
    
    if (decisionEvents.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const event of decisionEvents) {
        // 1. Append to event store
        await client.query(
          `INSERT INTO coutflex.domain_events 
           (event_id, event_type, aggregate_id, tenant_id, payload, metadata, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (event_id) DO NOTHING`,
          [
            event.eventId,
            event.eventType,
            event.aggregateId,
            event.tenantId,
            JSON.stringify(event.payload),
            JSON.stringify(event.metadata),
            event.occurredAt,
          ],
        );

        // 2. Apply projection
        const payload = event.payload;
        await client.query(
          `INSERT INTO coutflex.decision_records 
           (decision_id, tenant_id, project_id, decision, decided_by, decided_at, comments)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            payload.decisionId,
            payload.tenantId,
            payload.projectId,
            payload.decision,
            payload.decidedBy,
            payload.decidedAt,
            payload.comments,
          ],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (Tests)
// ─────────────────────────────────────────────────────────────

export class InMemoryDecisionRecordRepository implements DecisionRecordRepository {
  private decisions = new Map<string, DecisionRecordState[]>();
  private events: CostStructureEvent[] = [];

  async findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null> {
    const key = `${tenantId}:${projectId}`;
    const projectDecisions = this.decisions.get(key) || [];
    
    if (projectDecisions.length === 0) return null;
    
    // Return latest decision
    return projectDecisions[projectDecisions.length - 1];
  }

  async saveEvents(events: CostStructureEvent[]): Promise<void> {
    for (const event of events) {
      if (event.eventType === 'DecisionRecorded') {
        this.events.push(event);
        
        const payload = (event as DecisionRecorded).payload;
        const key = `${payload.tenantId}:${payload.projectId}`;
        
        const projectDecisions = this.decisions.get(key) || [];
        projectDecisions.push({
          decisionId: payload.decisionId,
          projectId: payload.projectId,
          tenantId: payload.tenantId,
          decision: payload.decision,
          decidedBy: payload.decidedBy,
          decidedAt: payload.decidedAt,
        });
        
        this.decisions.set(key, projectDecisions);
      }
    }
  }

  // Test helpers
  getEvents(): CostStructureEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.decisions.clear();
    this.events = [];
  }
}
