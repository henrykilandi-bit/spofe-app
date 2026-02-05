/**
 * Cost-Structure Repository
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Persistance append-only, aucune logique métier
 */

import { Pool } from 'pg';
import { EconomicProject } from '../domain/economic-project.aggregate';
import { ProjectType, ProjectStatus, Money, Quantity, EconomicScenarios, EconomicAssumptions, SimulationMetrics } from '../domain/value-objects';
import { CostStructureVersion } from '../domain/entities';

export class CostStructureRepository {
  constructor(private readonly db: Pool) {}

  /**
   * Sauvegarder un projet économique (append-only)
   */
  async save(project: EconomicProject): Promise<void> {
    const query = `
      INSERT INTO economic_projects (
        project_id, tenant_id, name, type, status,
        created_by, created_at, validated_at, validated_by,
        rejected_at, rejected_by, rejection_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (project_id) DO UPDATE SET
        status = EXCLUDED.status,
        validated_at = EXCLUDED.validated_at,
        validated_by = EXCLUDED.validated_by,
        rejected_at = EXCLUDED.rejected_at,
        rejected_by = EXCLUDED.rejected_by,
        rejection_reason = EXCLUDED.rejection_reason
    `;

    await this.db.query(query, [
      project.projectId,
      project.tenantId,
      project.name,
      project.type,
      project.status,
      project.createdBy,
      project.createdAt,
      project.validatedAt || null,
      project.validatedBy || null,
      project.rejectedAt || null,
      project.rejectedBy || null,
      project.rejectionReason || null,
    ]);

    // Sauvegarder les versions
    for (const version of project.versions) {
      await this.saveVersion(project.projectId, version);
    }
  }

  /**
   * Sauvegarder une version de structure de coûts
   */
  private async saveVersion(projectId: string, version: CostStructureVersion): Promise<void> {
    const query = `
      INSERT INTO cost_structure_versions (
        project_id, version, status, created_at,
        frozen_at, frozen_by,
        price_target, expected_volume, capacity_max,
        scenario_pessimistic, scenario_realistic, scenario_optimistic,
        unit_cost, total_cost, gross_margin, net_margin, margin_at_70, viable_at_70
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (project_id, version) DO UPDATE SET
        status = EXCLUDED.status,
        frozen_at = EXCLUDED.frozen_at,
        frozen_by = EXCLUDED.frozen_by,
        price_target = EXCLUDED.price_target,
        expected_volume = EXCLUDED.expected_volume,
        capacity_max = EXCLUDED.capacity_max,
        scenario_pessimistic = EXCLUDED.scenario_pessimistic,
        scenario_realistic = EXCLUDED.scenario_realistic,
        scenario_optimistic = EXCLUDED.scenario_optimistic,
        unit_cost = EXCLUDED.unit_cost,
        total_cost = EXCLUDED.total_cost,
        gross_margin = EXCLUDED.gross_margin,
        net_margin = EXCLUDED.net_margin,
        margin_at_70 = EXCLUDED.margin_at_70,
        viable_at_70 = EXCLUDED.viable_at_70
    `;

    await this.db.query(query, [
      projectId,
      version.version,
      version.status,
      version.createdAt,
      version.frozenAt || null,
      version.frozenBy || null,
      version.assumptions?.priceTarget.amount || null,
      version.assumptions?.expectedVolume.value || null,
      version.assumptions?.capacityMax.value || null,
      version.assumptions?.scenarios.pessimistic || null,
      version.assumptions?.scenarios.realistic || null,
      version.assumptions?.scenarios.optimistic || null,
      version.simulationMetrics?.unitCost.amount || null,
      version.simulationMetrics?.totalCost.amount || null,
      version.simulationMetrics?.grossMargin || null,
      version.simulationMetrics?.netMargin || null,
      version.simulationMetrics?.marginAt70 || null,
      version.simulationMetrics?.viableAt70 || null,
    ]);

    // Sauvegarder les lignes de coût
    for (const costLine of version.costLines) {
      await this.saveCostLine(projectId, version.version, costLine);
    }
  }

  /**
   * Sauvegarder une ligne de coût
   */
  private async saveCostLine(projectId: string, version: number, costLine: any): Promise<void> {
    const query = `
      INSERT INTO cost_lines (
        project_id, version, category, label, amount, currency, allocation_rule
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.db.query(query, [
      projectId,
      version,
      costLine.category,
      costLine.label,
      costLine.amount.amount,
      costLine.amount.currency,
      costLine.allocationRule || null,
    ]);
  }

  /**
   * Charger un projet par ID
   */
  async findById(projectId: string): Promise<EconomicProject | null> {
    const projectQuery = `
      SELECT * FROM economic_projects WHERE project_id = $1
    `;
    const projectResult = await this.db.query(projectQuery, [projectId]);

    if (projectResult.rows.length === 0) {
      return null;
    }

    const row = projectResult.rows[0];

    // Charger les versions
    const versions = await this.loadVersions(projectId);

    return new EconomicProject(
      row.project_id,
      row.tenant_id,
      row.name,
      row.type as ProjectType,
      row.status as ProjectStatus,
      versions,
      row.created_by,
      row.created_at,
      row.validated_at,
      row.validated_by,
      row.rejected_at,
      row.rejected_by,
      row.rejection_reason
    );
  }

  /**
   * Charger les versions d'un projet
   */
  private async loadVersions(projectId: string): Promise<CostStructureVersion[]> {
    const query = `
      SELECT * FROM cost_structure_versions
      WHERE project_id = $1
      ORDER BY version ASC
    `;
    const result = await this.db.query(query, [projectId]);

    const versions: CostStructureVersion[] = [];

    for (const row of result.rows) {
      const costLines = await this.loadCostLines(projectId, row.version);

      const assumptions = row.price_target
        ? new EconomicAssumptions(
            new Money(row.price_target),
            new Quantity(row.expected_volume),
            new Quantity(row.capacity_max),
            new EconomicScenarios(
              row.scenario_pessimistic,
              row.scenario_realistic,
              row.scenario_optimistic
            )
          )
        : undefined;

      const simulationMetrics = row.unit_cost
        ? new SimulationMetrics(
            new Money(row.unit_cost),
            new Money(row.total_cost),
            row.gross_margin,
            row.net_margin,
            row.margin_at_70,
            row.viable_at_70
          )
        : undefined;

      versions.push({
        version: row.version,
        status: row.status,
        costLines,
        assumptions,
        simulationMetrics,
        createdAt: row.created_at,
        frozenAt: row.frozen_at,
        frozenBy: row.frozen_by,
      });
    }

    return versions;
  }

  /**
   * Charger les lignes de coût d'une version
   */
  private async loadCostLines(projectId: string, version: number): Promise<any[]> {
    const query = `
      SELECT * FROM cost_lines
      WHERE project_id = $1 AND version = $2
      ORDER BY id ASC
    `;
    const result = await this.db.query(query, [projectId, version]);

    return result.rows.map((row) => ({
      category: row.category,
      label: row.label,
      amount: new Money(row.amount, row.currency),
      allocationRule: row.allocation_rule,
    }));
  }

  /**
   * Lister tous les projets d'un tenant
   */
  async findByTenant(tenantId: string): Promise<Array<{ projectId: string; name: string; status: ProjectStatus }>> {
    const query = `
      SELECT project_id, name, status
      FROM economic_projects
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [tenantId]);

    return result.rows.map((row) => ({
      projectId: row.project_id,
      name: row.name,
      status: row.status as ProjectStatus,
    }));
  }
}
