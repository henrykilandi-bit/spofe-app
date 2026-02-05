/**
 * PostgreSQL Implementation - Asset Write Repository
 * Module Immobilisation v1.0.0
 *
 * Implémentation PostgreSQL du repository write-side.
 * Append-only, pas de UPDATE/DELETE.
 */
import { Pool } from 'pg';
import { AssetWriteRepository } from './asset.repository';
import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
export declare class AssetPgRepository implements AssetWriteRepository {
    private readonly pool;
    constructor(pool: Pool);
    saveAsset(event: AssetCreated): Promise<void>;
    saveEvent(event: ImmobilisationEvent): Promise<void>;
    getAssetById(tenantId: string, assetId: string): Promise<any>;
    getDepreciationState(tenantId: string, assetId: string): Promise<any>;
    getActiveAllocations(tenantId: string, assetId: string): Promise<any[]>;
    private insertEvent;
}
//# sourceMappingURL=asset.pg.repository.d.ts.map