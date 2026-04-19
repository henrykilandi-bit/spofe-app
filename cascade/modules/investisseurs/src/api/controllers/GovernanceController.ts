import { Response } from 'express';
import { requireAllowedRole, requireTenantContext } from '../requestGuards';
import { AuthenticatedRequest, GovernanceAssemblyRow, GovernanceDocumentRow } from '../types';

export class GovernanceController {
  constructor(private readonly db: any) {}

  async getAssemblies(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    try {
      const result = await this.db.query(`
        SELECT assembly_id, assembly_type, assembly_date, created_at
        FROM governance_assemblies
        WHERE tenant_id = $1
        ORDER BY assembly_date DESC
      `, [tenantId]);

      res.json({
        assemblies: result.rows.map((row: GovernanceAssemblyRow) => ({
          assemblyId: row.assembly_id,
          assemblyType: row.assembly_type,
          assemblyDate: row.assembly_date,
          createdAt: row.created_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const tenantId = requireTenantContext(req, res);
    const { documentType, assemblyId } = req.query;

    if (!tenantId) {
      return;
    }

    if (!requireAllowedRole(req, res)) {
      return;
    }

    try {
      let query = `
        SELECT document_id, document_type, linked_assembly_id, created_at
        FROM governance_documents
        WHERE tenant_id = $1
      `;
      const params: any[] = [tenantId];

      if (documentType) {
        query += ` AND document_type = $${params.length + 1}`;
        params.push(documentType);
      }

      if (assemblyId) {
        query += ` AND linked_assembly_id = $${params.length + 1}`;
        params.push(assemblyId);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await this.db.query(query, params);

      res.json({
        documents: result.rows.map((row: GovernanceDocumentRow) => ({
          documentId: row.document_id,
          documentType: row.document_type,
          linkedAssemblyId: row.linked_assembly_id,
          createdAt: row.created_at
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
