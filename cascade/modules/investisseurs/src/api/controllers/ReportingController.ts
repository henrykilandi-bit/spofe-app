import { Response } from 'express';
import { requireAllowedRole, requireInvestorReportScope, requireTenantContext } from '../requestGuards';
import { AuthenticatedRequest, InvestorReportRow } from '../types';
import { sanitizeInvestorReports } from '../rowSanitizers';

export class ReportingController {
  constructor(private readonly db: any) {}

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    if (!requireInvestorReportScope(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT report_id, period, published_at
        FROM investor_reports
        WHERE tenant_id = $1
        ORDER BY published_at DESC
      `, [tenantId]);
      const safeRows = sanitizeInvestorReports(result.rows as unknown[]);

      res.json({
        reports: safeRows.map((row: InvestorReportRow) => ({
          reportId: row.report_id,
          period: row.period,
          publishedAt: row.published_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReportById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    const { reportId } = req.params;

    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    if (!requireInvestorReportScope(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT report_id, period, published_at
        FROM investor_reports
        WHERE tenant_id = $1 AND report_id = $2
      `, [tenantId, reportId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const safeRows = sanitizeInvestorReports(result.rows as unknown[]);
      if (safeRows.length === 0) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const report = safeRows[0] as InvestorReportRow;

      // TODO: Generate InvestorDocumentViewed event
      // await this.eventBus.publish({
      //   type: "InvestorDocumentViewed",
      //   tenantId,
      //   investorId: req.user?.investorId,
      //   resource: `report:${reportId}`,
      //   occurredAt: new Date().toISOString(),
      // });

      res.json({
        reportId: report.report_id,
        period: report.period,
        publishedAt: report.published_at
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
