import { Response } from 'express';
import { requireAllowedRole, requireTenantContext } from '../requestGuards';
import { AuthenticatedRequest, ShareholderRow } from '../types';

export class ShareholdersController {
  constructor(private readonly db: any) {}

  async getShareholders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT shareholder_id, name, created_at
        FROM shareholders
        WHERE tenant_id = $1
        ORDER BY created_at ASC
      `, [tenantId]);

      res.json({
        shareholders: result.rows.map((row: ShareholderRow) => ({
          shareholderId: row.shareholder_id,
          name: row.name,
          createdAt: row.created_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
