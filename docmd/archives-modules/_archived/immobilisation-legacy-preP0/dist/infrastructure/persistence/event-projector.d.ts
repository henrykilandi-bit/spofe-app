/**
 * Immobilisation Module - Event Projectors
 * Conformité: READ_MODELS.md v1.0.0, COMMANDS_EVENTS.md v1.0.0
 *
 * Projecteurs qui transforment les Events en Read-Models.
 * Principe: Projection unidirectionnelle, pas de logique métier.
 */
import { Pool } from 'pg';
import { ImmobilisationEventDTO } from '../../application/dto';
/**
 * Interface pour les projecteurs d'events
 */
export interface EventProjector {
    /**
     * Projette un event sur les read-models
     */
    project(event: ImmobilisationEventDTO): Promise<void>;
}
export declare class PostgresImmobilisationProjector implements EventProjector {
    private readonly pool;
    constructor(pool: Pool);
    private withClient;
    /**
     * Projette un event sur les read-models
     */
    project(event: ImmobilisationEventDTO): Promise<void>;
    private storeEvent;
    private getAggregateId;
    private getActorId;
    private projectAssetCreated;
    private projectRenewalInfoUpdated;
    private projectAssetAllocated;
    private projectDepreciationRecorded;
    private projectMaintenanceRecorded;
    private projectAssetDisposed;
    private projectAssetDecommissioned;
}
//# sourceMappingURL=event-projector.d.ts.map