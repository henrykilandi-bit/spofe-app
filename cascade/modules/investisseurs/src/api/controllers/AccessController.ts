import { Response } from 'express';
import { requireAllowedRole, requireTenantContext } from '../requestGuards';
import { AuthenticatedRequest, InvestorAccessRightsRow, InvestorAccessLogRow } from '../types';

export class AccessController {
  constructor(private readonly db: any) {}

  async getAccessRights(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    const investorId = req.user?.investorId; // From auth middleware

    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    if (!investorId) {
      res.status(401).json({ error: 'Investor authentication required' });
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT scope, granted_at
        FROM investor_access_rights
        WHERE tenant_id = $1 AND investor_id = $2
        ORDER BY granted_at DESC
      `, [tenantId, investorId]);

      res.json({
        tenantId,
        investorId,
        accessRights: result.rows.map((row: InvestorAccessRightsRow) => ({
          scope: row.scope,
          grantedAt: row.granted_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAccessLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    const userRole = req.user?.role; // From auth middleware

    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    // Only coach or entrepreneur can access full log
    if (!['ENTREPRENEUR', 'COACH'].includes(userRole || '')) {
      res.status(403).json({ error: 'Access denied. Coach or entrepreneur role required.' });
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT investor_id, resource, accessed_at
        FROM investor_access_log
        WHERE tenant_id = $1
        ORDER BY accessed_at DESC
        LIMIT 1000
      `, [tenantId]);

      res.json({
        tenantId,
        accessLog: result.rows.map((row: InvestorAccessLogRow) => ({
          investorId: row.investor_id,
          resource: row.resource,
          accessedAt: row.accessed_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
