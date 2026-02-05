"use strict";
/**
 * Repository: EconomicProject (Write-Side)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * ⚠️ WRITE-SIDE ONLY
 * - Event sourcing avec append-only
 * - SELECT ... FOR UPDATE pour locks
 * - RLS automatique via tenant_id
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEconomicProjectRepository = exports.PostgresEconomicProjectRepository = void 0;
// ─────────────────────────────────────────────────────────────
// PostgreSQL Implementation
// ─────────────────────────────────────────────────────────────
class PostgresEconomicProjectRepository {
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Find project by name (for uniqueness check)
     * Uses SELECT ... FOR UPDATE to prevent race conditions
     */
    async findByName(tenantId, name) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`SELECT 
          project_id,
          tenant_id,
          name,
          project_type,
          status,
          latest_version
         FROM coutflex.economic_projects 
         WHERE tenant_id = $1 AND name = $2
         FOR UPDATE`, [tenantId, name]);
            if (result.rows.length === 0)
                return null;
            const row = result.rows[0];
            return {
                projectId: row.project_id,
                tenantId: row.tenant_id,
                name: row.name,
                type: row.project_type,
                status: row.status,
                latestVersion: row.latest_version,
            };
        }
        finally {
            client.release();
        }
    }
    /**
     * Load project aggregate state
     */
    async load(tenantId, projectId) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`SELECT 
          project_id,
          tenant_id,
          name,
          project_type,
          status,
          latest_version
         FROM coutflex.economic_projects 
         WHERE tenant_id = $1 AND project_id = $2
         FOR UPDATE`, [tenantId, projectId]);
            if (result.rows.length === 0)
                return null;
            const row = result.rows[0];
            return {
                projectId: row.project_id,
                tenantId: row.tenant_id,
                name: row.name,
                type: row.project_type,
                status: row.status,
                latestVersion: row.latest_version,
            };
        }
        finally {
            client.release();
        }
    }
    /**
     * Save events — Append-only event store + projection update
     */
    async saveEvents(events) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const event of events) {
                // 1. Append to event store
                await client.query(`INSERT INTO coutflex.domain_events 
           (event_id, event_type, aggregate_id, tenant_id, payload, metadata, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                    event.eventId,
                    event.eventType,
                    event.aggregateId,
                    event.tenantId,
                    JSON.stringify(event.payload),
                    JSON.stringify(event.metadata),
                    event.occurredAt,
                ]);
                // 2. Apply projection (write-side state)
                await this.applyProjection(client, event);
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Apply event to write-side projection
     */
    async applyProjection(client, event) {
        switch (event.eventType) {
            case 'EconomicProjectCreated': {
                const payload = event.payload;
                await client.query(`INSERT INTO coutflex.economic_projects 
           (project_id, tenant_id, name, project_type, status, created_at, created_by)
           VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6)`, [
                    payload.projectId,
                    payload.tenantId,
                    payload.name,
                    payload.type,
                    payload.createdAt,
                    payload.createdBy,
                ]);
                break;
            }
            case 'ProjectValidated': {
                const payload = event.payload;
                await client.query(`UPDATE coutflex.economic_projects 
           SET status = 'APPROVED', validated_at = $3, validated_by = $4
           WHERE tenant_id = $1 AND project_id = $2`, [
                    payload.tenantId,
                    payload.projectId,
                    payload.validatedAt,
                    payload.validatedBy,
                ]);
                break;
            }
            case 'ProjectRejected': {
                const payload = event.payload;
                await client.query(`UPDATE coutflex.economic_projects 
           SET status = 'REJECTED', rejected_at = $3, rejected_by = $4
           WHERE tenant_id = $1 AND project_id = $2`, [
                    payload.tenantId,
                    payload.projectId,
                    payload.rejectedAt,
                    payload.rejectedBy,
                ]);
                break;
            }
            case 'CostStructureFrozen': {
                // Update project status to FROZEN
                await client.query(`UPDATE coutflex.economic_projects 
           SET status = 'FROZEN'
           WHERE tenant_id = $1 AND project_id = $2`, [event.tenantId, event.payload.projectId]);
                break;
            }
        }
    }
}
exports.PostgresEconomicProjectRepository = PostgresEconomicProjectRepository;
// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (Tests)
// ─────────────────────────────────────────────────────────────
class InMemoryEconomicProjectRepository {
    constructor() {
        this.projects = new Map();
        this.events = [];
    }
    async findByName(tenantId, name) {
        for (const project of this.projects.values()) {
            if (project.tenantId === tenantId && project.name === name) {
                return project;
            }
        }
        return null;
    }
    async load(tenantId, projectId) {
        const key = `${tenantId}:${projectId}`;
        return this.projects.get(key) ?? null;
    }
    async saveEvents(events) {
        for (const event of events) {
            this.events.push(event);
            if (event.eventType === 'EconomicProjectCreated') {
                const payload = event.payload;
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
                const payload = event.payload;
                const key = `${payload.tenantId}:${payload.projectId}`;
                const project = this.projects.get(key);
                if (project) {
                    project.status = 'APPROVED';
                }
            }
            if (event.eventType === 'ProjectRejected') {
                const payload = event.payload;
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
    getEvents() {
        return [...this.events];
    }
    clear() {
        this.projects.clear();
        this.events = [];
    }
}
exports.InMemoryEconomicProjectRepository = InMemoryEconomicProjectRepository;
//# sourceMappingURL=economic-project.repository.js.map