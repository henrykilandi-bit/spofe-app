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
import type { CostStructureEvent } from '../../domain/events/index.js';
import type { CostStructureState } from '../../domain/guardian/cost-structure.guardian.js';
export interface CostStructureRepository {
    loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
}
export declare class PostgresCostStructureRepository implements CostStructureRepository {
    private readonly pool;
    constructor(pool: Pool);
    /**
     * Load aggregate state by replaying events
     */
    loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null>;
    /**
     * Save events — Append-only event store + projection update
     */
    saveEvents(events: CostStructureEvent[]): Promise<void>;
    /**
     * Replay events to reconstruct aggregate state
     */
    private replayEvents;
    /**
     * Map database row to state
     */
    private mapRowToState;
    /**
     * Apply event to write-side projection
     */
    private applyProjection;
}
export declare class InMemoryCostStructureRepository implements CostStructureRepository {
    private structures;
    private events;
    loadAggregate(tenantId: string, projectId: string, version: number): Promise<CostStructureState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
    getEvents(): CostStructureEvent[];
    clear(): void;
    setState(state: CostStructureState): void;
}
//# sourceMappingURL=cost-structure.repository.d.ts.map