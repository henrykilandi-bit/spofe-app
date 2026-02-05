/**
 * Immobilisation Module - Read-Model Repository PostgreSQL Implementation
 * Conformité: READ_MODELS.md v1.0.0
 *
 * Implémentation PostgreSQL du repository read-model.
 */
// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
function buildPagination(filter) {
    const parts = [];
    if (filter.limit)
        parts.push(`LIMIT ${filter.limit}`);
    if (filter.offset)
        parts.push(`OFFSET ${filter.offset}`);
    return parts.join(' ');
}
function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
function mapRowToCamelCase(row) {
    const result = {};
    for (const [key, value] of Object.entries(row)) {
        result[toCamelCase(key)] = value;
    }
    return result;
}
function mapRowsToCamelCase(rows) {
    return rows.map(row => mapRowToCamelCase(row));
}
// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════
export class PostgresImmobilisationReadModelRepository {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async withClient(fn) {
        const client = await this.pool.connect();
        try {
            return await fn(client);
        }
        finally {
            client.release();
        }
    }
    async setTenant(client, tenantId) {
        await client.query(`SELECT set_current_tenant($1::uuid)`, [tenantId]);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Assets
    // ─────────────────────────────────────────────────────────────────────────
    async findAllAssets(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetById(tenantId, assetId) {
        return this.withClient(async (client) => {
            await this.setTenant(client, tenantId);
            const sql = `
        SELECT * FROM rm_assets_current
        WHERE tenant_id = $1 AND asset_id = $2
      `;
            const result = await client.query(sql, [tenantId, assetId]);
            return result.rows.length > 0 ? mapRowToCamelCase(result.rows[0]) : null;
        });
    }
    async findAssetsInService(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const sql = `
        SELECT * FROM rm_assets_in_service
        WHERE tenant_id = $1
        ORDER BY created_at DESC
        ${buildPagination(filter)}
      `;
            const result = await client.query(sql, [filter.tenantId]);
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetNetBookValues(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetNetBookValue(tenantId, assetId) {
        return this.withClient(async (client) => {
            await this.setTenant(client, tenantId);
            const sql = `
        SELECT * FROM rm_asset_net_book_value
        WHERE tenant_id = $1 AND asset_id = $2
      `;
            const result = await client.query(sql, [tenantId, assetId]);
            return result.rows.length > 0 ? mapRowToCamelCase(result.rows[0]) : null;
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Depreciation
    // ─────────────────────────────────────────────────────────────────────────
    async findDepreciationHistory(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetDepreciationHistory(tenantId, assetId) {
        return this.findDepreciationHistory({ tenantId, assetId });
    }
    async findDepreciationSummary(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findDepreciationForCostStructure(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Allocations
    // ─────────────────────────────────────────────────────────────────────────
    async findEffectiveAllocations(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAllAllocations(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetAllocations(tenantId, assetId, activeOnly = true) {
        const filter = { tenantId, assetId, activeOnly };
        return activeOnly ? this.findEffectiveAllocations(filter) : this.findAllAllocations(filter);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Maintenance
    // ─────────────────────────────────────────────────────────────────────────
    async findMaintenanceHistory(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetMaintenanceHistory(tenantId, assetId) {
        return this.findMaintenanceHistory({ tenantId, assetId });
    }
    async findMaintenanceSummary(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findMaintenanceByPeriod(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Renewal & Disposal
    // ─────────────────────────────────────────────────────────────────────────
    async findRenewalProjections(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findDisposalHistory(filter) {
        return this.withClient(async (client) => {
            await this.setTenant(client, filter.tenantId);
            const conditions = ['tenant_id = $1'];
            const params = [filter.tenantId];
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
            return mapRowsToCamelCase(result.rows);
        });
    }
    async findAssetDisposal(tenantId, assetId) {
        return this.withClient(async (client) => {
            await this.setTenant(client, tenantId);
            const sql = `
        SELECT * FROM rm_asset_disposal_history
        WHERE tenant_id = $1 AND asset_id = $2
      `;
            const result = await client.query(sql, [tenantId, assetId]);
            return result.rows.length > 0 ? mapRowToCamelCase(result.rows[0]) : null;
        });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // KPIs
    // ─────────────────────────────────────────────────────────────────────────
    async findKpi(tenantId) {
        return this.withClient(async (client) => {
            await this.setTenant(client, tenantId);
            const sql = `
        SELECT * FROM rm_immobilisation_kpi
        WHERE tenant_id = $1
      `;
            const result = await client.query(sql, [tenantId]);
            return result.rows.length > 0 ? mapRowToCamelCase(result.rows[0]) : null;
        });
    }
}
//# sourceMappingURL=postgres-read-model.repository.js.map