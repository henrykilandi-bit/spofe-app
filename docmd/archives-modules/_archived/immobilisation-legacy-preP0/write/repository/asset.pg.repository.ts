/**
 * PostgreSQL Implementation - Asset Write Repository
 * Module Immobilisation v1.0.0
 * 
 * Implémentation PostgreSQL du repository write-side.
 * Append-only, pas de UPDATE/DELETE.
 */

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import {
  AssetWriteRepository,
  ASSET_REPOSITORY,
} from './asset.repository';
import { AssetCreated, ImmobilisationEvent } from '../../domain/events';

@Injectable()
export class AssetPgRepository implements AssetWriteRepository {
  constructor(
    @Inject('DB_POOL') private readonly pool: Pool,
  ) {}

  async saveAsset(event: AssetCreated): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert asset
      await client.query(
        `INSERT INTO assets (
          tenant_id, asset_id, designation, description, category,
          acquisition_cost, currency, acquisition_date, service_start_date,
          useful_life_months, depreciation_method, residual_value,
          renewal_date, replacement_cost, net_book_value, status,
          created_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
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
        ]
      );

      // Insert event
      await this.insertEvent(client, event);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async saveEvent(event: ImmobilisationEvent): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.insertEvent(client, event);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAssetById(tenantId: string, assetId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM assets WHERE tenant_id = $1 AND asset_id = $2`,
      [tenantId, assetId]
    );
    return result.rows[0] || null;
  }

  async getDepreciationState(tenantId: string, assetId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT 
        asset_id,
        COALESCE(SUM(depreciation_amount), 0) as accumulated_depreciation,
        MAX(period) as last_depreciated_period,
        ARRAY_AGG(period ORDER BY period) as depreciated_periods
       FROM depreciation_records 
       WHERE tenant_id = $1 AND asset_id = $2
       GROUP BY asset_id`,
      [tenantId, assetId]
    );
    
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

  async getActiveAllocations(tenantId: string, assetId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM asset_allocations 
       WHERE tenant_id = $1 AND asset_id = $2 AND effective_to IS NULL`,
      [tenantId, assetId]
    );
    return result.rows;
  }

  private async insertEvent(client: any, event: ImmobilisationEvent): Promise<void> {
    await client.query(
      `INSERT INTO immobilisation_events (
        event_id, event_type, tenant_id, asset_id, payload,
        correlation_id, causation_id, actor_id, timestamp, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
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
      ]
    );
  }
}
