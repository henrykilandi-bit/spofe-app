/**
 * Repository: DecisionRecord (Write-Side)
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * ⚠️ WRITE-SIDE ONLY
 * - Gère les décisions terminales (VALIDATE, REJECT)
 * - Invariant COUT-DEC-02: Decision is terminal
 */
import type { Pool } from 'pg';
import type { CostStructureEvent } from '../../domain/events/index.js';
import type { DecisionRecordState } from '../../domain/guardian/cost-structure.guardian.js';
export interface DecisionRecordRepository {
    findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
}
export declare class PostgresDecisionRecordRepository implements DecisionRecordRepository {
    private readonly pool;
    constructor(pool: Pool);
    /**
     * Find latest decision for project (for terminal check)
     */
    findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null>;
    /**
     * Save events — Filter for DecisionRecorded only
     */
    saveEvents(events: CostStructureEvent[]): Promise<void>;
}
export declare class InMemoryDecisionRecordRepository implements DecisionRecordRepository {
    private decisions;
    private events;
    findLatestForProject(tenantId: string, projectId: string): Promise<DecisionRecordState | null>;
    saveEvents(events: CostStructureEvent[]): Promise<void>;
    getEvents(): CostStructureEvent[];
    clear(): void;
}
//# sourceMappingURL=decision-record.repository.d.ts.map