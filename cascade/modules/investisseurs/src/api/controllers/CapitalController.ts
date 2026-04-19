import { Response } from 'express';
import { requireAllowedRole, requireTenantContext } from '../requestGuards';
import { AuthenticatedRequest, CapTableCurrentRow, CapTableHistoryRow } from '../types';

export class CapitalController {
  constructor(private readonly db: any) {}

  async getCapTable(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT shareholder_id, shares, percentage, last_updated_at
        FROM cap_table_current
        WHERE tenant_id = $1
        ORDER BY percentage DESC
      `, [tenantId]);

      res.json({
        tenantId,
        capTable: result.rows.map((row: CapTableCurrentRow) => ({
          shareholderId: row.shareholder_id,
          shares: row.shares,
          percentage: row.percentage,
          lastUpdatedAt: row.last_updated_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCapTableHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT shareholder_id, shares, percentage, occurred_at
        FROM cap_table_history
        WHERE tenant_id = $1
        ORDER BY occurred_at ASC
      `, [tenantId]);

      res.json({
        tenantId,
        history: result.rows.map((row: CapTableHistoryRow) => ({
          shareholderId: row.shareholder_id,
          shares: row.shares,
          percentage: row.percentage,
          occurredAt: row.occurred_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
