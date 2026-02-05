/**
 * Immobilisation Module - Event Projectors
 * Conformité: READ_MODELS.md v1.0.0, COMMANDS_EVENTS.md v1.0.0
 *
 * Projecteurs qui transforment les Events en Read-Models.
 * Principe: Projection unidirectionnelle, pas de logique métier.
 */
import { isAssetCreatedEvent, isRenewalInfoUpdatedEvent, isAssetAllocatedEvent, isDepreciationRecordedEvent, isMaintenanceRecordedEvent, isAssetDisposedEvent, isAssetDecommissionedEvent, } from '../../application/dto';
// ═══════════════════════════════════════════════════════════════════════════
// POSTGRES PROJECTOR IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════
export class PostgresImmobilisationProjector {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async withClient(fn) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
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
     * Projette un event sur les read-models
     */
    async project(event) {
        // Store event first
        await this.storeEvent(event);
        // Project to appropriate tables
        if (isAssetCreatedEvent(event)) {
            await this.projectAssetCreated(event);
        }
        else if (isRenewalInfoUpdatedEvent(event)) {
            await this.projectRenewalInfoUpdated(event);
        }
        else if (isAssetAllocatedEvent(event)) {
            await this.projectAssetAllocated(event);
        }
        else if (isDepreciationRecordedEvent(event)) {
            await this.projectDepreciationRecorded(event);
        }
        else if (isMaintenanceRecordedEvent(event)) {
            await this.projectMaintenanceRecorded(event);
        }
        else if (isAssetDisposedEvent(event)) {
            await this.projectAssetDisposed(event);
        }
        else if (isAssetDecommissionedEvent(event)) {
            await this.projectAssetDecommissioned(event);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Event Store
    // ─────────────────────────────────────────────────────────────────────────
    async storeEvent(event) {
        await this.withClient(async (client) => {
            const sql = `
        INSERT INTO immobilisation_events (
          event_id, tenant_id, aggregate_type, aggregate_id,
          event_type, event_data, actor_id, occurred_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
            const aggregateId = this.getAggregateId(event);
            const actorId = this.getActorId(event);
            await client.query(sql, [
                event.eventId,
                event.tenantId,
                'Asset',
                aggregateId,
                event.type,
                JSON.stringify(event),
                actorId,
                event.occurredAt,
            ]);
        });
    }
    getAggregateId(event) {
        if ('assetId' in event)
            return event.assetId;
        if ('maintenanceId' in event)
            return event.assetId;
        throw new Error(`Cannot determine aggregate ID for event type: ${event.type}`);
    }
    getActorId(event) {
        if ('createdBy' in event)
            return event.createdBy;
        if ('updatedBy' in event)
            return event.updatedBy;
        if ('allocatedBy' in event)
            return event.allocatedBy;
        if ('calculatedBy' in event)
            return event.calculatedBy;
        if ('recordedBy' in event)
            return event.recordedBy;
        if ('disposedBy' in event)
            return event.disposedBy;
        if ('decommissionedBy' in event)
            return event.decommissionedBy;
        return 'unknown';
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Asset Projections
    // ─────────────────────────────────────────────────────────────────────────
    async projectAssetCreated(event) {
        await this.withClient(async (client) => {
            const sql = `
        INSERT INTO assets (
          asset_id, tenant_id,
          acquisition_cost, currency, acquisition_date,
          useful_life_months, depreciation_method, residual_value,
          renewal_date, replacement_cost,
          status, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
            await client.query(sql, [
                event.assetId,
                event.tenantId,
                event.acquisitionCost,
                event.currency,
                event.acquisitionDate,
                event.usefulLifeMonths,
                event.depreciationMethod,
                event.residualValue,
                event.renewalDate || null,
                event.replacementCost || null,
                'IN_SERVICE',
                event.createdBy,
                event.occurredAt,
            ]);
        });
    }
    async projectRenewalInfoUpdated(event) {
        await this.withClient(async (client) => {
            const sql = `
        UPDATE assets
        SET renewal_date = $3,
            replacement_cost = $4,
            updated_at = $5
        WHERE asset_id = $1 AND tenant_id = $2
      `;
            await client.query(sql, [
                event.assetId,
                event.tenantId,
                event.renewalDate,
                event.replacementCost || null,
                event.occurredAt,
            ]);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Allocation Projections
    // ─────────────────────────────────────────────────────────────────────────
    async projectAssetAllocated(event) {
        await this.withClient(async (client) => {
            // End existing allocations
            const endSql = `
        UPDATE asset_allocations
        SET effective_to = $3,
            ended_by = $4,
            ended_at = $5,
            end_reason = 'Replaced by new allocation'
        WHERE asset_id = $1 AND tenant_id = $2 AND effective_to IS NULL
      `;
            await client.query(endSql, [
                event.assetId,
                event.tenantId,
                event.effectiveFrom,
                event.allocatedBy,
                event.occurredAt,
            ]);
            // Insert new allocations
            const insertSql = `
        INSERT INTO asset_allocations (
          allocation_id, asset_id, tenant_id,
          target_type, target_id, percentage,
          effective_from, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
            for (const allocation of event.allocations) {
                await client.query(insertSql, [
                    allocation.allocationId,
                    event.assetId,
                    event.tenantId,
                    allocation.targetType,
                    allocation.targetId,
                    allocation.percentage,
                    event.effectiveFrom,
                    event.allocatedBy,
                    event.occurredAt,
                ]);
            }
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Depreciation Projections
    // ─────────────────────────────────────────────────────────────────────────
    async projectDepreciationRecorded(event) {
        await this.withClient(async (client) => {
            const sql = `
        INSERT INTO depreciation_records (
          schedule_id, asset_id, tenant_id,
          period, depreciation_amount, accumulated_depreciation,
          net_book_value, currency,
          calculated_by, calculated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (asset_id, period) DO UPDATE SET
          depreciation_amount = EXCLUDED.depreciation_amount,
          accumulated_depreciation = EXCLUDED.accumulated_depreciation,
          net_book_value = EXCLUDED.net_book_value,
          calculated_by = EXCLUDED.calculated_by,
          calculated_at = EXCLUDED.calculated_at
      `;
            await client.query(sql, [
                event.scheduleId,
                event.assetId,
                event.tenantId,
                event.period,
                event.depreciationAmount,
                event.accumulatedDepreciation,
                event.netBookValue,
                event.currency,
                event.calculatedBy,
                event.occurredAt,
            ]);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Maintenance Projections
    // ─────────────────────────────────────────────────────────────────────────
    async projectMaintenanceRecorded(event) {
        await this.withClient(async (client) => {
            const sql = `
        INSERT INTO maintenance_records (
          maintenance_id, asset_id, tenant_id,
          maintenance_type, maintenance_date, description,
          cost, currency, performed_by,
          recorded_by, recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
            await client.query(sql, [
                event.maintenanceId,
                event.assetId,
                event.tenantId,
                event.maintenanceType,
                event.date,
                event.description,
                event.cost,
                event.currency,
                event.performedBy,
                event.recordedBy,
                event.occurredAt,
            ]);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Disposal Projections
    // ─────────────────────────────────────────────────────────────────────────
    async projectAssetDisposed(event) {
        await this.withClient(async (client) => {
            // Update asset status
            const updateAssetSql = `
        UPDATE assets
        SET status = 'DISPOSED', updated_at = $3
        WHERE asset_id = $1 AND tenant_id = $2
      `;
            await client.query(updateAssetSql, [
                event.assetId,
                event.tenantId,
                event.occurredAt,
            ]);
            // End all allocations
            const endAllocationsSql = `
        UPDATE asset_allocations
        SET effective_to = $3,
            ended_by = $4,
            ended_at = $5,
            end_reason = 'Asset disposed'
        WHERE asset_id = $1 AND tenant_id = $2 AND effective_to IS NULL
      `;
            await client.query(endAllocationsSql, [
                event.assetId,
                event.tenantId,
                event.disposalDate,
                event.disposedBy,
                event.occurredAt,
            ]);
            // Record disposal
            const insertDisposalSql = `
        INSERT INTO asset_disposals (
          disposal_id, asset_id, tenant_id,
          disposal_date, disposal_type, disposal_value, currency,
          net_book_value, gain_or_loss,
          disposed_by, disposed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
            await client.query(insertDisposalSql, [
                event.eventId, // Use event ID as disposal ID
                event.assetId,
                event.tenantId,
                event.disposalDate,
                event.disposalType,
                event.disposalValue,
                event.currency,
                event.netBookValue,
                event.gainOrLoss,
                event.disposedBy,
                event.occurredAt,
            ]);
        });
    }
    async projectAssetDecommissioned(event) {
        await this.withClient(async (client) => {
            // Update asset status
            const updateAssetSql = `
        UPDATE assets
        SET status = 'SCRAPPED', updated_at = $3
        WHERE asset_id = $1 AND tenant_id = $2
      `;
            await client.query(updateAssetSql, [
                event.assetId,
                event.tenantId,
                event.occurredAt,
            ]);
            // End all allocations
            const endAllocationsSql = `
        UPDATE asset_allocations
        SET effective_to = $3,
            ended_by = $4,
            ended_at = $5,
            end_reason = 'Asset decommissioned'
        WHERE asset_id = $1 AND tenant_id = $2 AND effective_to IS NULL
      `;
            await client.query(endAllocationsSql, [
                event.assetId,
                event.tenantId,
                event.decommissionDate,
                event.decommissionedBy,
                event.occurredAt,
            ]);
            // Record disposal (as SCRAP)
            const insertDisposalSql = `
        INSERT INTO asset_disposals (
          disposal_id, asset_id, tenant_id,
          disposal_date, disposal_type, disposal_value, currency,
          net_book_value, gain_or_loss, reason,
          disposed_by, disposed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
            await client.query(insertDisposalSql, [
                event.eventId, // Use event ID as disposal ID
                event.assetId,
                event.tenantId,
                event.decommissionDate,
                'SCRAP',
                0, // No disposal value for scrap
                event.currency,
                event.netBookValue,
                -event.netBookValue, // Loss = full NBV
                event.reason,
                event.decommissionedBy,
                event.occurredAt,
            ]);
        });
    }
}
//# sourceMappingURL=event-projector.js.map