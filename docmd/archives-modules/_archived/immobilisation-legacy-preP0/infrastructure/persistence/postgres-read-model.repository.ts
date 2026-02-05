/**
 * Immobilisation Module - Read-Model Repository PostgreSQL Implementation
 * Conformité: READ_MODELS.md v1.0.0
 * 
 * Implémentation PostgreSQL du repository read-model.
 */

import { Pool, PoolClient } from 'pg';
import {
  ImmobilisationReadModelRepository,
} from './read-model.repository';
import {
  RmAssetsCurrent,
  RmAssetDepreciationHistory,
  RmAssetDepreciationSummary,
  RmAssetAllocationEffective,
  RmAssetAllocationAll,
  RmAssetMaintenanceHistory,
  RmAssetMaintenanceSummary,
  RmAssetMaintenanceByPeriod,
  RmAssetsRenewalProjection,
  RmAssetDisposalHistory,
  RmAssetNetBookValue,
  RmAssetsInService,
  RmDepreciationCostStructureExport,
  RmImmobilisationKpi,
  AssetFilter,
  PeriodFilter,
  AllocationFilter,
  RenewalFilter,
  ReadModelFilter,
} from './read-model.types';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function buildPagination(filter: ReadModelFilter): string {
  const parts: string[] = [];
  if (filter.limit) parts.push(`LIMIT ${filter.limit}`);
  if (filter.offset) parts.push(`OFFSET ${filter.offset}`);
  return parts.join(' ');
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapRowToCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[toCamelCase(key)] = value;
  }
  return result as T;
}

function mapRowsToCamelCase<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map(row => mapRowToCamelCase<T>(row));
}

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export class PostgresImmobilisationReadModelRepository implements ImmobilisationReadModelRepository {
  constructor(private readonly pool: Pool) {}

  private async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  private async setTenant(client: PoolClient, tenantId: string): Promise<void> {
    await client.query(`SELECT set_current_tenant($1::uuid)`, [tenantId]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Assets
  // ─────────────────────────────────────────────────────────────────────────

  async findAllAssets(filter: AssetFilter): Promise<RmAssetsCurrent[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(filter.status);
      }
      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }

      const sql = `
        SELECT * FROM rm_assets_current
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetsCurrent>(result.rows);
    });
  }

  async findAssetById(tenantId: string, assetId: string): Promise<RmAssetsCurrent | null> {
    return this.withClient(async (client) => {
      await this.setTenant(client, tenantId);
      
      const sql = `
        SELECT * FROM rm_assets_current
        WHERE tenant_id = $1 AND asset_id = $2
      `;
      
      const result = await client.query(sql, [tenantId, assetId]);
      return result.rows.length > 0 ? mapRowToCamelCase<RmAssetsCurrent>(result.rows[0]) : null;
    });
  }

  async findAssetsInService(filter: ReadModelFilter): Promise<RmAssetsInService[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const sql = `
        SELECT * FROM rm_assets_in_service
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, [filter.tenantId]);
      return mapRowsToCamelCase<RmAssetsInService>(result.rows);
    });
  }

  async findAssetNetBookValues(filter: AssetFilter): Promise<RmAssetNetBookValue[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(filter.status);
      }
      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }

      const sql = `
        SELECT * FROM rm_asset_net_book_value
        WHERE ${conditions.join(' AND ')}
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetNetBookValue>(result.rows);
    });
  }

  async findAssetNetBookValue(tenantId: string, assetId: string): Promise<RmAssetNetBookValue | null> {
    return this.withClient(async (client) => {
      await this.setTenant(client, tenantId);
      
      const sql = `
        SELECT * FROM rm_asset_net_book_value
        WHERE tenant_id = $1 AND asset_id = $2
      `;

      const result = await client.query(sql, [tenantId, assetId]);
      return result.rows.length > 0 ? mapRowToCamelCase<RmAssetNetBookValue>(result.rows[0]) : null;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Depreciation
  // ─────────────────────────────────────────────────────────────────────────

  async findDepreciationHistory(filter: PeriodFilter & { assetId?: string }): Promise<RmAssetDepreciationHistory[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }
      if (filter.periodFrom) {
        conditions.push(`period >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`period <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_asset_depreciation_history
        WHERE ${conditions.join(' AND ')}
        ORDER BY period
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetDepreciationHistory>(result.rows);
    });
  }

  async findAssetDepreciationHistory(tenantId: string, assetId: string): Promise<RmAssetDepreciationHistory[]> {
    return this.findDepreciationHistory({ tenantId, assetId });
  }

  async findDepreciationSummary(filter: PeriodFilter): Promise<RmAssetDepreciationSummary[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.periodFrom) {
        conditions.push(`period >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`period <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_asset_depreciation_summary
        WHERE ${conditions.join(' AND ')}
        ORDER BY period
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetDepreciationSummary>(result.rows);
    });
  }

  async findDepreciationForCostStructure(filter: PeriodFilter): Promise<RmDepreciationCostStructureExport[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.periodFrom) {
        conditions.push(`period >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`period <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_depreciation_cost_structure_export
        WHERE ${conditions.join(' AND ')}
        ORDER BY period, asset_id
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmDepreciationCostStructureExport>(result.rows);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Allocations
  // ─────────────────────────────────────────────────────────────────────────

  async findEffectiveAllocations(filter: AllocationFilter): Promise<RmAssetAllocationEffective[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }
      if (filter.targetType) {
        conditions.push(`target_type = $${paramIndex++}`);
        params.push(filter.targetType);
      }
      if (filter.targetId) {
        conditions.push(`target_id = $${paramIndex++}`);
        params.push(filter.targetId);
      }

      const sql = `
        SELECT * FROM rm_asset_allocation_effective
        WHERE ${conditions.join(' AND ')}
        ORDER BY effective_from
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetAllocationEffective>(result.rows);
    });
  }

  async findAllAllocations(filter: AllocationFilter): Promise<RmAssetAllocationAll[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }
      if (filter.targetType) {
        conditions.push(`target_type = $${paramIndex++}`);
        params.push(filter.targetType);
      }
      if (filter.targetId) {
        conditions.push(`target_id = $${paramIndex++}`);
        params.push(filter.targetId);
      }

      const sql = `
        SELECT * FROM rm_asset_allocation_all
        WHERE ${conditions.join(' AND ')}
        ORDER BY effective_from
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetAllocationAll>(result.rows);
    });
  }

  async findAssetAllocations(tenantId: string, assetId: string, activeOnly = true): Promise<RmAssetAllocationEffective[]> {
    const filter: AllocationFilter = { tenantId, assetId, activeOnly };
    return activeOnly ? this.findEffectiveAllocations(filter) : this.findAllAllocations(filter) as Promise<RmAssetAllocationEffective[]>;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Maintenance
  // ─────────────────────────────────────────────────────────────────────────

  async findMaintenanceHistory(filter: PeriodFilter & { assetId?: string }): Promise<RmAssetMaintenanceHistory[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }
      if (filter.periodFrom) {
        conditions.push(`TO_CHAR(maintenance_date, 'YYYY-MM') >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`TO_CHAR(maintenance_date, 'YYYY-MM') <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_asset_maintenance_history
        WHERE ${conditions.join(' AND ')}
        ORDER BY maintenance_date
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetMaintenanceHistory>(result.rows);
    });
  }

  async findAssetMaintenanceHistory(tenantId: string, assetId: string): Promise<RmAssetMaintenanceHistory[]> {
    return this.findMaintenanceHistory({ tenantId, assetId });
  }

  async findMaintenanceSummary(filter: AssetFilter): Promise<RmAssetMaintenanceSummary[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.assetId) {
        conditions.push(`asset_id = $${paramIndex++}`);
        params.push(filter.assetId);
      }

      const sql = `
        SELECT * FROM rm_asset_maintenance_summary
        WHERE ${conditions.join(' AND ')}
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetMaintenanceSummary>(result.rows);
    });
  }

  async findMaintenanceByPeriod(filter: PeriodFilter): Promise<RmAssetMaintenanceByPeriod[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.periodFrom) {
        conditions.push(`period >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`period <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_asset_maintenance_by_period
        WHERE ${conditions.join(' AND ')}
        ORDER BY period
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetMaintenanceByPeriod>(result.rows);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Renewal & Disposal
  // ─────────────────────────────────────────────────────────────────────────

  async findRenewalProjections(filter: RenewalFilter): Promise<RmAssetsRenewalProjection[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.renewalYearFrom) {
        conditions.push(`renewal_year >= $${paramIndex++}`);
        params.push(filter.renewalYearFrom);
      }
      if (filter.renewalYearTo) {
        conditions.push(`renewal_year <= $${paramIndex++}`);
        params.push(filter.renewalYearTo);
      }

      const sql = `
        SELECT * FROM rm_assets_renewal_projection
        WHERE ${conditions.join(' AND ')}
        ORDER BY renewal_date
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetsRenewalProjection>(result.rows);
    });
  }

  async findDisposalHistory(filter: PeriodFilter): Promise<RmAssetDisposalHistory[]> {
    return this.withClient(async (client) => {
      await this.setTenant(client, filter.tenantId);
      
      const conditions: string[] = ['tenant_id = $1'];
      const params: unknown[] = [filter.tenantId];
      let paramIndex = 2;

      if (filter.periodFrom) {
        conditions.push(`TO_CHAR(disposal_date, 'YYYY-MM') >= $${paramIndex++}`);
        params.push(filter.periodFrom);
      }
      if (filter.periodTo) {
        conditions.push(`TO_CHAR(disposal_date, 'YYYY-MM') <= $${paramIndex++}`);
        params.push(filter.periodTo);
      }

      const sql = `
        SELECT * FROM rm_asset_disposal_history
        WHERE ${conditions.join(' AND ')}
        ORDER BY disposal_date DESC
        ${buildPagination(filter)}
      `;

      const result = await client.query(sql, params);
      return mapRowsToCamelCase<RmAssetDisposalHistory>(result.rows);
    });
  }

  async findAssetDisposal(tenantId: string, assetId: string): Promise<RmAssetDisposalHistory | null> {
    return this.withClient(async (client) => {
      await this.setTenant(client, tenantId);
      
      const sql = `
        SELECT * FROM rm_asset_disposal_history
        WHERE tenant_id = $1 AND asset_id = $2
      `;

      const result = await client.query(sql, [tenantId, assetId]);
      return result.rows.length > 0 ? mapRowToCamelCase<RmAssetDisposalHistory>(result.rows[0]) : null;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KPIs
  // ─────────────────────────────────────────────────────────────────────────

  async findKpi(tenantId: string): Promise<RmImmobilisationKpi | null> {
    return this.withClient(async (client) => {
      await this.setTenant(client, tenantId);
      
      const sql = `
        SELECT * FROM rm_immobilisation_kpi
        WHERE tenant_id = $1
      `;

      const result = await client.query(sql, [tenantId]);
      return result.rows.length > 0 ? mapRowToCamelCase<RmImmobilisationKpi>(result.rows[0]) : null;
    });
  }
}
