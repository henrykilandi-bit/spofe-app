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
import type { CostStructureEvent } from '../../domain/events/index.js';
import type { EconomicProjectState } from '../../domain/guardian/cost-structure.guardian.js';
export interface EconomicProjectRepository {
    findByName(tenantId: string, name: string): Promise<EconomicProjectState | null>;
    load(tenantId: string, projectId: string): Promise<EconomicProjectState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
}
export declare class PostgresEconomicProjectRepository implements EconomicProjectRepository {
    private readonly pool;
    constructor(pool: Pool);
    /**
     * Find project by name (for uniqueness check)
     * Uses SELECT ... FOR UPDATE to prevent race conditions
     */
    findByName(tenantId: string, name: string): Promise<EconomicProjectState | null>;
    /**
     * Load project aggregate state
     */
    load(tenantId: string, projectId: string): Promise<EconomicProjectState | null>;
    /**
     * Save events — Append-only event store + projection update
     */
    saveEvents(events: CostStructureEvent[]): Promise<void>;
    /**
     * Apply event to write-side projection
     */
    private applyProjection;
}
export declare class InMemoryEconomicProjectRepository implements EconomicProjectRepository {
    private projects;
    private events;
    findByName(tenantId: string, name: string): Promise<EconomicProjectState | null>;
    load(tenantId: string, projectId: string): Promise<EconomicProjectState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
    getEvents(): CostStructureEvent[];
    clear(): void;
}
//# sourceMappingURL=economic-project.repository.d.ts.map