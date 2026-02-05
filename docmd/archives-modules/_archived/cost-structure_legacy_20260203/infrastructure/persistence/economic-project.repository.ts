/**
 * Repository: EconomicProject (Write-Side)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * ⚠️ WRITE-SIDE ONLY
 * - Event sourcing avec append-only
 * - SELECT ... FOR UPDATE pour locks
 * - RLS automatique via tenant_id
 */

import type { Pool } from 'pg';
import type { 
  EconomicProjectCreated, 
  ProjectValidated, 
  ProjectRejected,
  CostStructureEvent,
} from '../../domain/events/index.js';
import type { EconomicProjectState } from '../../domain/guardian/cost-structure.guardian.js';

// ─────────────────────────────────────────────────────────────
// Repository Interface
// ─────────────────────────────────────────────────────────────

export interface EconomicProjectRepository {
  findByName(tenantId: string, name: string): Promise<EconomicProjectState | null>;
  load(tenantId: string, projectId: string): Promise<EconomicProjectState | null>;
  saveEvents(events: CostStructureEvent[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// PostgreSQL Implementation
// ─────────────────────────────────────────────────────────────

export class PostgresEconomicProjectRepository implements EconomicProjectRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Find project by name (for uniqueness check)
   * Uses SELECT ... FOR UPDATE to prevent race conditions
   */
  async findByName(tenantId: string, name: string): Promise<EconomicProjectState | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          project_id,
          tenant_id,
          name,
          project_type,
          status,
          latest_version
         FROM coutflex.economic_projects 
         WHERE tenant_id = $1 AND name = $2
         FOR UPDATE`,
        [tenantId, name],
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        projectId: row.project_id,
        tenantId: row.tenant_id,
        name: row.name,
        type: row.project_type,
        status: row.status,
        latestVersion: row.latest_version,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Load project aggregate state
   */
  async load(tenantId: string, projectId: string): Promise<EconomicProjectState | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          project_id,
          tenant_id,
          name,
          project_type,
          status,
          latest_version
         FROM coutflex.economic_projects 
         WHERE tenant_id = $1 AND project_id = $2
         FOR UPDATE`,
        [tenantId, projectId],
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        projectId: row.project_id,
        tenantId: row.tenant_id,
        name: row.name,
        type: row.project_type,
        status: row.status,
        latestVersion: row.latest_version,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Save events — Append-only event store + projection update
   */
  async saveEvents(events: CostStructureEvent[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const event of events) {
        // 1. Append to event store
        await client.query(
          `INSERT INTO coutflex.domain_events 
           (event_id, event_type, aggregate_id, tenant_id, payload, metadata, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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

        // 2. Apply projection (write-side state)
        await this.applyProjection(client, event);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply event to write-side projection
   */
  private async applyProjection(client: any, event: CostStructureEvent): Promise<void> {
    switch (event.eventType) {
      case 'EconomicProjectCreated': {
        const payload = (event as EconomicProjectCreated).payload;
        await client.query(
          `INSERT INTO coutflex.economic_projects 
           (project_id, tenant_id, name, project_type, status, created_at, created_by)
           VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6)`,
          [
            payload.projectId,
            payload.tenantId,
            payload.name,
            payload.type,
            payload.createdAt,
            payload.createdBy,
          ],
        );
        break;
      }

      case 'ProjectValidated': {
        const payload = (event as ProjectValidated).payload;
        await client.query(
          `UPDATE coutflex.economic_projects 
           SET status = 'APPROVED', validated_at = $3, validated_by = $4
           WHERE tenant_id = $1 AND project_id = $2`,
          [
            payload.tenantId,
            payload.projectId,
            payload.validatedAt,
            payload.validatedBy,
          ],
        );
        break;
      }

      case 'ProjectRejected': {
        const payload = (event as ProjectRejected).payload;
        await client.query(
          `UPDATE coutflex.economic_projects 
           SET status = 'REJECTED', rejected_at = $3, rejected_by = $4
           WHERE tenant_id = $1 AND project_id = $2`,
          [
            payload.tenantId,
            payload.projectId,
            payload.rejectedAt,
            payload.rejectedBy,
          ],
        );
        break;
      }

      case 'CostStructureFrozen': {
        // Update project status to FROZEN
        await client.query(
          `UPDATE coutflex.economic_projects 
           SET status = 'FROZEN'
           WHERE tenant_id = $1 AND project_id = $2`,
          [event.tenantId, event.payload.projectId],
        );
        break;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (Tests)
// ─────────────────────────────────────────────────────────────

export class InMemoryEconomicProjectRepository implements EconomicProjectRepository {
  private projects = new Map<string, EconomicProjectState>();
  private events: CostStructureEvent[] = [];

  async findByName(tenantId: string, name: string): Promise<EconomicProjectState | null> {
    for (const project of this.projects.values()) {
      if (project.tenantId === tenantId && project.name === name) {
        return project;
      }
    }
    return null;
  }

  async load(tenantId: string, projectId: string): Promise<EconomicProjectState | null> {
    const key = `${tenantId}:${projectId}`;
    return this.projects.get(key) ?? null;
  }

  async saveEvents(events: CostStructureEvent[]): Promise<void> {
    for (const event of events) {
      this.events.push(event);

      if (event.eventType === 'EconomicProjectCreated') {
        const payload = (event as EconomicProjectCreated).payload;
        const key = `${payload.tenantId}:${payload.projectId}`;
        this.projects.set(key, {
          projectId: payload.projectId,
          tenantId: payload.tenantId,
          name: payload.name,
          type: payload.type,
          status: 'DRAFT',
        });
      }

      if (event.eventType === 'ProjectValidated') {
        const payload = (event as ProjectValidated).payload;
        const key = `${payload.tenantId}:${payload.projectId}`;
        const project = this.projects.get(key);
        if (project) {
          project.status = 'APPROVED';
        }
      }

      if (event.eventType === 'ProjectRejected') {
        const payload = (event as ProjectRejected).payload;
        const key = `${payload.tenantId}:${payload.projectId}`;
        const project = this.projects.get(key);
        if (project) {
          project.status = 'REJECTED';
        }
      }

      if (event.eventType === 'CostStructureFrozen') {
        const key = `${event.tenantId}:${event.payload.projectId}`;
        const project = this.projects.get(key);
        if (project) {
          project.status = 'FROZEN';
        }
      }
    }
  }

  // Test helpers
  getEvents(): CostStructureEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.projects.clear();
    this.events = [];
  }
}
