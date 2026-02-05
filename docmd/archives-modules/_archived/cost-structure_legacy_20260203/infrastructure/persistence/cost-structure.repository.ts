/**
 * Repository: CostStructure (Write-Side)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 * 
 * ⚠️ WRITE-SIDE ONLY
 * - Event sourcing avec append-only
 * - Reconstruction d'agrégat depuis events
 * - RLS automatique via tenant_id
 */

import type { Pool } from 'pg';
import type { 
  CostStructureCreated,
  CostLineAdded,
  AssumptionsUpdated,
  CostStructureSimulated,
  CostStructureFrozen,
  CostStructureEvent,
} from '../../domain/events/index.js';
import type { CostStructureState, CostLine, AssumptionsState, SimulationResult } from '../../domain/guardian/cost-structure.guardian.js';

// ─────────────────────────────────────────────────────────────
// Repository Interface
// ─────────────────────────────────────────────────────────────

export interface CostStructureRepository {
  loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null>;
  saveEvents(events: CostStructureEvent[]): Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// PostgreSQL Implementation
// ─────────────────────────────────────────────────────────────

export class PostgresCostStructureRepository implements CostStructureRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Load aggregate state by replaying events
   */
  async loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null> {
    const client = await this.pool.connect();
    try {
      // Lock the aggregate
      await client.query(
        `SELECT 1 FROM coutflex.cost_structures 
         WHERE tenant_id = $1 AND project_id = $2 AND version = $3
         FOR UPDATE`,
        [tenantId, projectId, version],
      );

      // Load all events for this aggregate
      const aggregateId = `${projectId}:v${version}`;
      const result = await client.query(
        `SELECT event_type, payload, occurred_at
         FROM coutflex.domain_events 
         WHERE tenant_id = $1 AND aggregate_id = $2
         ORDER BY occurred_at ASC`,
        [tenantId, aggregateId],
      );

      if (result.rows.length === 0) {
        // Check if cost structure exists without events (fallback)
        const csResult = await client.query(
          `SELECT cs.*, 
                  COALESCE(json_agg(cl.*) FILTER (WHERE cl.line_id IS NOT NULL), '[]') as cost_lines
           FROM coutflex.cost_structures cs
           LEFT JOIN coutflex.cost_lines cl ON cs.tenant_id = cl.tenant_id 
             AND cs.project_id = cl.project_id AND cs.version = cl.version
           WHERE cs.tenant_id = $1 AND cs.project_id = $2 AND cs.version = $3
           GROUP BY cs.tenant_id, cs.project_id, cs.version`,
          [tenantId, projectId, version],
        );

        if (csResult.rows.length === 0) return null;

        const row = csResult.rows[0];
        return this.mapRowToState(row);
      }

      // Replay events to build state
      return this.replayEvents(tenantId, projectId, version, result.rows);
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

        // 2. Apply projection
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
   * Replay events to reconstruct aggregate state
   */
  private replayEvents(
    tenantId: string,
    projectId: string,
    version: number,
    eventRows: any[],
  ): CostStructureState {
    let state: CostStructureState = {
      tenantId,
      projectId,
      version,
      status: 'DRAFT',
      costLines: [],
    };

    for (const row of eventRows) {
      const payload = row.payload;

      switch (row.event_type) {
        case 'CostStructureCreated':
          state.status = 'DRAFT';
          break;

        case 'CostLineAdded':
          state.costLines.push({
            lineId: payload.lineId,
            category: payload.category,
            label: payload.label,
            amount: payload.amount,
            currency: payload.currency,
            allocationRule: payload.allocationRule,
          });
          break;

        case 'AssumptionsUpdated':
          state.assumptions = {
            priceTarget: payload.priceTarget,
            expectedVolume: payload.expectedVolume,
            capacityMax: payload.capacityMax,
            scenarios: payload.scenarios,
          };
          break;

        case 'CostStructureSimulated':
          state.status = 'SIMULATED';
          state.simulation = {
            totalCost: payload.totalCost,
            variableCostRatio: payload.variableCostRatio,
            breakEvenPoint: payload.breakEvenPoint,
            marginAtTarget: payload.marginAtTarget,
            scenarioResults: payload.scenarioResults,
          };
          break;

        case 'CostStructureFrozen':
          state.status = 'FROZEN';
          break;
      }
    }

    return state;
  }

  /**
   * Map database row to state
   */
  private mapRowToState(row: any): CostStructureState {
    return {
      tenantId: row.tenant_id,
      projectId: row.project_id,
      version: row.version,
      status: row.status,
      costLines: (row.cost_lines || []).map((cl: any) => ({
        lineId: cl.line_id,
        category: cl.category,
        label: cl.label,
        amount: parseFloat(cl.amount),
        currency: cl.currency,
        allocationRule: cl.allocation_rule,
      })),
      assumptions: row.price_target ? {
        priceTarget: parseFloat(row.price_target),
        expectedVolume: row.expected_volume,
        capacityMax: row.capacity_max,
        scenarios: row.scenarios,
      } : undefined,
      simulation: row.total_cost ? {
        totalCost: parseFloat(row.total_cost),
        variableCostRatio: parseFloat(row.variable_cost_ratio),
        breakEvenPoint: row.break_even_point,
        marginAtTarget: parseFloat(row.margin_at_target),
        scenarioResults: row.scenario_results,
      } : undefined,
    };
  }

  /**
   * Apply event to write-side projection
   */
  private async applyProjection(client: any, event: CostStructureEvent): Promise<void> {
    switch (event.eventType) {
      case 'CostStructureCreated': {
        const payload = (event as CostStructureCreated).payload;
        await client.query(
          `INSERT INTO coutflex.cost_structures 
           (tenant_id, project_id, version, status, created_at, created_by)
           VALUES ($1, $2, $3, 'DRAFT', $4, $5)`,
          [
            payload.tenantId,
            payload.projectId,
            payload.version,
            payload.createdAt,
            payload.createdBy,
          ],
        );
        break;
      }

      case 'CostLineAdded': {
        const payload = (event as CostLineAdded).payload;
        await client.query(
          `INSERT INTO coutflex.cost_lines 
           (tenant_id, project_id, version, line_id, category, label, amount, currency, allocation_rule, added_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            payload.tenantId,
            payload.projectId,
            payload.version,
            payload.lineId,
            payload.category,
            payload.label,
            payload.amount,
            payload.currency,
            payload.allocationRule,
            payload.addedAt,
          ],
        );
        break;
      }

      case 'AssumptionsUpdated': {
        const payload = (event as AssumptionsUpdated).payload;
        await client.query(
          `UPDATE coutflex.cost_structures 
           SET price_target = $4, expected_volume = $5, capacity_max = $6, scenarios = $7
           WHERE tenant_id = $1 AND project_id = $2 AND version = $3`,
          [
            payload.tenantId,
            payload.projectId,
            payload.version,
            payload.priceTarget,
            payload.expectedVolume,
            payload.capacityMax,
            JSON.stringify(payload.scenarios),
          ],
        );
        break;
      }

      case 'CostStructureSimulated': {
        const payload = (event as CostStructureSimulated).payload;
        await client.query(
          `UPDATE coutflex.cost_structures 
           SET status = 'SIMULATED', 
               total_cost = $4, 
               variable_cost_ratio = $5,
               break_even_point = $6,
               margin_at_target = $7,
               scenario_results = $8,
               simulated_at = $9
           WHERE tenant_id = $1 AND project_id = $2 AND version = $3`,
          [
            payload.tenantId,
            payload.projectId,
            payload.version,
            payload.totalCost,
            payload.variableCostRatio,
            payload.breakEvenPoint,
            payload.marginAtTarget,
            JSON.stringify(payload.scenarioResults),
            payload.simulatedAt,
          ],
        );
        break;
      }

      case 'CostStructureFrozen': {
        const payload = (event as CostStructureFrozen).payload;
        await client.query(
          `UPDATE coutflex.cost_structures 
           SET status = 'FROZEN', frozen_at = $4, frozen_by = $5
           WHERE tenant_id = $1 AND project_id = $2 AND version = $3`,
          [
            payload.tenantId,
            payload.projectId,
            payload.version,
            payload.frozenAt,
            payload.frozenBy,
          ],
        );

        // Update project latest_version
        await client.query(
          `UPDATE coutflex.economic_projects 
           SET latest_version = GREATEST(COALESCE(latest_version, 0), $3)
           WHERE tenant_id = $1 AND project_id = $2`,
          [payload.tenantId, payload.projectId, payload.version],
        );
        break;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (Tests)
// ─────────────────────────────────────────────────────────────

export class InMemoryCostStructureRepository implements CostStructureRepository {
  private structures = new Map<string, CostStructureState>();
  private events: CostStructureEvent[] = [];

  async loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null> {
    const key = `${tenantId}:${projectId}:v${version}`;
    return this.structures.get(key) ?? null;
  }

  async saveEvents(events: CostStructureEvent[]): Promise<void> {
    for (const event of events) {
      this.events.push(event);

      if (event.eventType === 'CostStructureCreated') {
        const payload = (event as CostStructureCreated).payload;
        const key = `${payload.tenantId}:${payload.projectId}:v${payload.version}`;
        this.structures.set(key, {
          tenantId: payload.tenantId,
          projectId: payload.projectId,
          version: payload.version,
          status: 'DRAFT',
          costLines: [],
        });
      }

      if (event.eventType === 'CostLineAdded') {
        const payload = (event as CostLineAdded).payload;
        const key = `${payload.tenantId}:${payload.projectId}:v${payload.version}`;
        const structure = this.structures.get(key);
        if (structure) {
          structure.costLines.push({
            lineId: payload.lineId,
            category: payload.category,
            label: payload.label,
            amount: payload.amount,
            currency: payload.currency,
            allocationRule: payload.allocationRule,
          });
        }
      }

      if (event.eventType === 'AssumptionsUpdated') {
        const payload = (event as AssumptionsUpdated).payload;
        const key = `${payload.tenantId}:${payload.projectId}:v${payload.version}`;
        const structure = this.structures.get(key);
        if (structure) {
          structure.assumptions = {
            priceTarget: payload.priceTarget,
            expectedVolume: payload.expectedVolume,
            capacityMax: payload.capacityMax,
            scenarios: payload.scenarios,
          };
        }
      }

      if (event.eventType === 'CostStructureSimulated') {
        const payload = (event as CostStructureSimulated).payload;
        const key = `${payload.tenantId}:${payload.projectId}:v${payload.version}`;
        const structure = this.structures.get(key);
        if (structure) {
          structure.status = 'SIMULATED';
          structure.simulation = {
            totalCost: payload.totalCost,
            variableCostRatio: payload.variableCostRatio,
            breakEvenPoint: payload.breakEvenPoint,
            marginAtTarget: payload.marginAtTarget,
            scenarioResults: payload.scenarioResults,
          };
        }
      }

      if (event.eventType === 'CostStructureFrozen') {
        const payload = (event as CostStructureFrozen).payload;
        const key = `${payload.tenantId}:${payload.projectId}:v${payload.version}`;
        const structure = this.structures.get(key);
        if (structure) {
          structure.status = 'FROZEN';
        }
      }
    }
  }

  // Test helpers
  getEvents(): CostStructureEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.structures.clear();
    this.events = [];
  }

  // Helper to setup test state
  setState(state: CostStructureState): void {
    const key = `${state.tenantId}:${state.projectId}:v${state.version}`;
    this.structures.set(key, state);
  }
}
