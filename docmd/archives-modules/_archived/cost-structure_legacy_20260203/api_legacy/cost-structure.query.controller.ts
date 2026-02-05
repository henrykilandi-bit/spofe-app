/**
 * Cost-Structure Query Controller (Read-Models)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Lecture seule, aucune logique métier, exposition décisions validées
 */

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CostStructureQueryRepository } from '../infrastructure/cost-structure.query.repository';

@ApiTags('Cost Structure - Queries (Read-Models)')
@ApiBearerAuth()
@Controller('/api/cost-structure/queries')
export class CostStructureQueryController {
  constructor(private readonly queryRepo: CostStructureQueryRepository) {}

  /**
   * Liste des projets économiques
   */
  @Get('/projects')
  @ApiOperation({ summary: 'Liste des projets économiques (rm_cost_projects)' })
  @ApiResponse({ status: 200, description: 'Liste des projets' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async listProjects(@Query('tenantId') tenantId: string) {
    return await this.queryRepo.findAllProjects(tenantId);
  }

  /**
   * Détail d'un projet
   */
  @Get('/projects/:projectId')
  @ApiOperation({ summary: 'Détail d\'un projet (rm_cost_projects)' })
  @ApiResponse({ status: 200, description: 'Projet trouvé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getProject(
    @Param('projectId') projectId: string,
    @Query('tenantId') tenantId: string
  ) {
    const project = await this.queryRepo.findProjectById(tenantId, projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  /**
   * Structure de coûts courante (FROZEN)
   */
  @Get('/projects/:projectId/current-structure')
  @ApiOperation({ summary: 'Structure de coûts courante FROZEN (rm_cost_structure_current)' })
  @ApiResponse({ status: 200, description: 'Structure trouvée' })
  @ApiResponse({ status: 404, description: 'Aucune structure FROZEN' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getCurrentStructure(
    @Param('projectId') projectId: string,
    @Query('tenantId') tenantId: string
  ) {
    const structure = await this.queryRepo.findCurrentCostStructure(tenantId, projectId);
    if (!structure) {
      throw new Error('No FROZEN cost structure found');
    }
    return structure;
  }

  /**
   * Lignes de coût d'une version
   */
  @Get('/projects/:projectId/versions/:version/cost-lines')
  @ApiOperation({ summary: 'Lignes de coût (rm_cost_lines)' })
  @ApiResponse({ status: 200, description: 'Lignes de coût' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getCostLines(
    @Param('projectId') projectId: string,
    @Param('version') version: number,
    @Query('tenantId') tenantId: string
  ) {
    return await this.queryRepo.findCostLines(tenantId, projectId, version);
  }

  /**
   * Résultats de simulation
   */
  @Get('/projects/:projectId/versions/:version/simulation')
  @ApiOperation({ summary: 'Résultats de simulation (rm_cost_simulation_results)' })
  @ApiResponse({ status: 200, description: 'Résultats trouvés' })
  @ApiResponse({ status: 404, description: 'Simulation non effectuée' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getSimulationResults(
    @Param('projectId') projectId: string,
    @Param('version') version: number,
    @Query('tenantId') tenantId: string
  ) {
    const results = await this.queryRepo.findSimulationResults(tenantId, projectId, version);
    if (!results) {
      throw new Error('Simulation not found');
    }
    return results;
  }

  /**
   * Décisions finales (audit)
   */
  @Get('/projects/:projectId/decisions')
  @ApiOperation({ summary: 'Décisions finales (rm_cost_decisions)' })
  @ApiResponse({ status: 200, description: 'Historique des décisions' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getDecisions(
    @Param('projectId') projectId: string,
    @Query('tenantId') tenantId: string
  ) {
    return await this.queryRepo.findDecisions(tenantId, projectId);
  }

  /**
   * Projets prêts pour Budget (CONTRACTUEL)
   */
  @Get('/budget-ready')
  @ApiOperation({ 
    summary: 'Projets prêts pour Budget (rm_cost_projects_budget_ready)',
    description: 'Vue contractuelle consommée par le module Budget. Uniquement projets VALIDATED avec test 70% OK.'
  })
  @ApiResponse({ status: 200, description: 'Projets budgétables' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getBudgetReadyProjects(@Query('tenantId') tenantId: string) {
    return await this.queryRepo.findBudgetReadyProjects(tenantId);
  }

  /**
   * Résumé structure de coûts
   */
  @Get('/projects/:projectId/versions/:version/summary')
  @ApiOperation({ summary: 'Résumé agrégé (rm_cost_structure_summary)' })
  @ApiResponse({ status: 200, description: 'Résumé trouvé' })
  @ApiResponse({ status: 404, description: 'Version non trouvée' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async getCostStructureSummary(
    @Param('projectId') projectId: string,
    @Param('version') version: number,
    @Query('tenantId') tenantId: string
  ) {
    const summary = await this.queryRepo.findCostStructureSummary(tenantId, projectId, version);
    if (!summary) {
      throw new Error('Cost structure summary not found');
    }
    return summary;
  }
}
