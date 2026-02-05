/**
 * PostgreSQL Implementation - Asset Write Repository
 * Module Immobilisation v1.0.0
 *
 * Implémentation PostgreSQL du repository write-side.
 * Append-only, pas de UPDATE/DELETE.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
let AssetPgRepository = class AssetPgRepository {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async saveAsset(event) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Insert asset
            await client.query(`INSERT INTO assets (
          tenant_id, asset_id, designation, description, category,
          acquisition_cost, currency, acquisition_date, service_start_date,
          useful_life_months, depreciation_method, residual_value,
          renewal_date, replacement_cost, net_book_value, status,
          created_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`, [
                event.payload.tenantId,
                event.payload.assetId,
                event.payload.designation,
                event.payload.description,
                event.payload.category,
                event.payload.acquisitionCost,
                event.payload.currency,
                event.payload.acquisitionDate,
                event.payload.serviceStartDate,
                event.payload.usefulLifeMonths,
                event.payload.depreciationMethod,
                event.payload.residualValue,
                event.payload.renewalDate,
                event.payload.replacementCost,
                event.payload.initialNetBookValue,
                'IN_SERVICE',
                event.occurredAt,
                event.metadata.actorId,
            ]);
            // Insert event
            await this.insertEvent(client, event);
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
    async saveEvent(event) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.insertEvent(client, event);
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
    async getAssetById(tenantId, assetId) {
        const result = await this.pool.query(`SELECT * FROM assets WHERE tenant_id = $1 AND asset_id = $2`, [tenantId, assetId]);
        return result.rows[0] || null;
    }
    async getDepreciationState(tenantId, assetId) {
        const result = await this.pool.query(`SELECT 
        asset_id,
        COALESCE(SUM(depreciation_amount), 0) as accumulated_depreciation,
        MAX(period) as last_depreciated_period,
        ARRAY_AGG(period ORDER BY period) as depreciated_periods
       FROM depreciation_records 
       WHERE tenant_id = $1 AND asset_id = $2
       GROUP BY asset_id`, [tenantId, assetId]);
        if (result.rows.length === 0) {
            // Return initial state (no depreciation yet)
            const asset = await this.getAssetById(tenantId, assetId);
            return {
                assetId,
                depreciatedPeriods: [],
                accumulatedDepreciation: 0,
                netBookValue: asset?.acquisition_cost || 0,
            };
        }
        const row = result.rows[0];
        return {
            assetId: row.asset_id,
            depreciatedPeriods: row.depreciated_periods || [],
            accumulatedDepreciation: parseFloat(row.accumulated_depreciation),
            netBookValue: 0, // Will be calculated from asset
        };
    }
    async getActiveAllocations(tenantId, assetId) {
        const result = await this.pool.query(`SELECT * FROM asset_allocations 
       WHERE tenant_id = $1 AND asset_id = $2 AND effective_to IS NULL`, [tenantId, assetId]);
        return result.rows;
    }
    async insertEvent(client, event) {
        await client.query(`INSERT INTO immobilisation_events (
        event_id, event_type, tenant_id, asset_id, payload,
        correlation_id, causation_id, actor_id, timestamp, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
            event.eventId,
            event.eventType,
            event.metadata.tenantId,
            event.aggregateId,
            JSON.stringify(event.payload),
            event.metadata.correlationId,
            event.metadata.causationId,
            event.metadata.actorId,
            event.occurredAt,
            event.metadata.version,
        ]);
    }
};
AssetPgRepository = __decorate([
    Injectable(),
    __param(0, Inject('DB_POOL')),
    __metadata("design:paramtypes", [Pool])
], AssetPgRepository);
export { AssetPgRepository };
//# sourceMappingURL=asset.pg.repository.js.map