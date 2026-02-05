"use strict";
/**
 * Cost-Structure Query Repository (Read-Models)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Lecture seule, aucun calcul métier, exposition décisions validées
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostStructureQueryRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
/**
 * Query Repository - Read-Models uniquement
 */
let CostStructureQueryRepository = class CostStructureQueryRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * Helper: Set tenant context for RLS
     */
    async setTenantContext(tenantId) {
        await this.db.query(`SET app.tenant_id = $1`, [tenantId]);
    }
    /**
     * Vue 1: Liste des projets économiques
     */
    async findAllProjects(tenantId) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        name,
        type,
        status,
        current_version,
        created_at,
        validated_at,
        rejected_at,
        rejection_reason
      FROM rm_cost_projects
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(query);
        return result.rows.map((row) => ({
            tenantId: row.tenant_id,
            projectId: row.project_id,
            name: row.name,
            type: row.type,
            status: row.status,
            currentVersion: row.current_version,
            createdAt: row.created_at,
            validatedAt: row.validated_at,
            rejectedAt: row.rejected_at,
            rejectionReason: row.rejection_reason,
        }));
    }
    /**
     * Vue 1: Projet par ID
     */
    async findProjectById(tenantId, projectId) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        name,
        type,
        status,
        current_version,
        created_at,
        validated_at,
        rejected_at,
        rejection_reason
      FROM rm_cost_projects
      WHERE project_id = $1
    `;
        const result = await this.db.query(query, [projectId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            tenantId: row.tenant_id,
            projectId: row.project_id,
            name: row.name,
            type: row.type,
            status: row.status,
            currentVersion: row.current_version,
            createdAt: row.created_at,
            validatedAt: row.validated_at,
            rejectedAt: row.rejected_at,
            rejectionReason: row.rejection_reason,
        };
    }
    /**
     * Vue 2: Structure de coûts courante (FROZEN)
     */
    async findCurrentCostStructure(tenantId, projectId) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        version,
        status,
        created_at,
        frozen_at,
        frozen_by
      FROM rm_cost_structure_current
      WHERE project_id = $1
    `;
        const result = await this.db.query(query, [projectId]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            tenantId: row.tenant_id,
            projectId: row.project_id,
            version: row.version,
            status: row.status,
            createdAt: row.created_at,
            frozenAt: row.frozen_at,
            frozenBy: row.frozen_by,
        };
    }
    /**
     * Vue 3: Lignes de coût
     */
    async findCostLines(tenantId, projectId, version) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        version,
        category,
        label,
        amount,
        currency,
        allocation_rule,
        created_at
      FROM rm_cost_lines
      WHERE project_id = $1 AND version = $2
      ORDER BY category, label
    `;
        const result = await this.db.query(query, [projectId, version]);
        return result.rows.map((row) => ({
            tenantId: row.tenant_id,
            projectId: row.project_id,
            version: row.version,
            category: row.category,
            label: row.label,
            amount: parseFloat(row.amount),
            currency: row.currency,
            allocationRule: row.allocation_rule,
            createdAt: row.created_at,
        }));
    }
    /**
     * Vue 4: Résultats de simulation
     */
    async findSimulationResults(tenantId, projectId, version) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        version,
        unit_cost,
        total_cost,
        gross_margin,
        net_margin,
        margin_at_70,
        viable_at_70,
        simulated_at
      FROM rm_cost_simulation_results
      WHERE project_id = $1 AND version = $2
    `;
        const result = await this.db.query(query, [projectId, version]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            tenantId: row.tenant_id,
            projectId: row.project_id,
            version: row.version,
            unitCost: parseFloat(row.unit_cost),
            totalCost: parseFloat(row.total_cost),
            grossMargin: parseFloat(row.gross_margin),
            netMargin: parseFloat(row.net_margin),
            marginAt70: parseFloat(row.margin_at_70),
            viableAt70: row.viable_at_70,
            simulatedAt: row.simulated_at,
        };
    }
    /**
     * Vue 5: Décisions finales
     */
    async findDecisions(tenantId, projectId) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        version,
        decision,
        decided_by,
        decided_at,
        justification
      FROM rm_cost_decisions
      WHERE project_id = $1
      ORDER BY decided_at DESC
    `;
        const result = await this.db.query(query, [projectId]);
        return result.rows.map((row) => ({
            tenantId: row.tenant_id,
            projectId: row.project_id,
            version: row.version,
            decision: row.decision,
            decidedBy: row.decided_by,
            decidedAt: row.decided_at,
            justification: row.justification,
        }));
    }
    /**
     * Vue 6: Projets prêts pour Budget (CONTRACTUEL)
     */
    async findBudgetReadyProjects(tenantId) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        name,
        type,
        version,
        unit_cost,
        total_cost,
        net_margin,
        margin_at_70,
        viable_at_70,
        validated_at
      FROM rm_cost_projects_budget_ready
      ORDER BY validated_at DESC
    `;
        const result = await this.db.query(query);
        return result.rows.map((row) => ({
            tenantId: row.tenant_id,
            projectId: row.project_id,
            name: row.name,
            type: row.type,
            version: row.version,
            unitCost: parseFloat(row.unit_cost),
            totalCost: parseFloat(row.total_cost),
            netMargin: parseFloat(row.net_margin),
            marginAt70: parseFloat(row.margin_at_70),
            viableAt70: row.viable_at_70,
            validatedAt: row.validated_at,
        }));
    }
    /**
     * Vue 7: Résumé structure de coûts
     */
    async findCostStructureSummary(tenantId, projectId, version) {
        await this.setTenantContext(tenantId);
        const query = `
      SELECT
        tenant_id,
        project_id,
        version,
        cost_lines_count,
        total_variable_cost,
        total_fixed_cost,
        total_indirect_cost,
        total_cost_sum,
        status,
        frozen_at
      FROM rm_cost_structure_summary
      WHERE project_id = $1 AND version = $2
    `;
        const result = await this.db.query(query, [projectId, version]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            tenantId: row.tenant_id,
            projectId: row.project_id,
            version: row.version,
            costLinesCount: parseInt(row.cost_lines_count),
            totalVariableCost: parseFloat(row.total_variable_cost),
            totalFixedCost: parseFloat(row.total_fixed_cost),
            totalIndirectCost: parseFloat(row.total_indirect_cost),
            totalCostSum: parseFloat(row.total_cost_sum),
            status: row.status,
            frozenAt: row.frozen_at,
        };
    }
};
exports.CostStructureQueryRepository = CostStructureQueryRepository;
exports.CostStructureQueryRepository = CostStructureQueryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pg_1.Pool])
], CostStructureQueryRepository);
//# sourceMappingURL=cost-structure.query.repository.js.map