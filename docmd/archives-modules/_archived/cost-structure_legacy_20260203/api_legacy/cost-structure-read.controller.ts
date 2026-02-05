/**
 * Cost-Structure Read API Controller (HTTP GET)
 * Conformité: COUTFLEX API Contract v1.0.0
 * Principe: GET uniquement, 1 endpoint = 1 read-model SQL, aucune logique métier
 */

import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/swagger';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CostStructureQueryRepository } from '../infrastructure/cost-structure.query.repository';
import {
  ProjectListResponseDTO,
  ProjectListItemResponseDTO,
} from './dto/response/project-list.response.dto';
import { CostStructureResponseDTO } from './dto/response/cost-structure.response.dto';
import {
  CostLinesResponseDTO,
  CostLineItemResponseDTO,
} from './dto/response/cost-lines.response.dto';
import { SimulationResponseDTO } from './dto/response/simulation.response.dto';
import { DecisionResponseDTO } from './dto/response/decision.response.dto';
import {
  BudgetReadyProjectsResponseDTO,
  BudgetReadyProjectItemResponseDTO,
} from './dto/response/budget-ready.response.dto';
import {
  ProjectHistoryResponseDTO,
  ProjectHistoryItemResponseDTO,
} from './dto/response/project-history.response.dto';

@ApiTags('Cost-Structure - Read API (GET)')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' })
@Controller('/api/cost-structure')
export class CostStructureReadController {
  constructor(private readonly queryRepo: CostStructureQueryRepository) {}

  /**
   * Helper: Extract tenant ID from headers
   */
  private getTenantId(headers: any): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new HttpException('X-Tenant-Id header is required', HttpStatus.BAD_REQUEST);
    }
    return tenantId;
  }

  /**
   * Endpoint 1: Liste des projets économiques
   * GET /api/cost-structure/projects
   * Vue SQL: rm_cost_projects
   */
  @Get('/projects')
  @ApiOperation({
    summary: 'Liste des projets économiques',
    description: 'Retourne tous les projets du tenant. Vue SQL: rm_cost_projects',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SIMULATED', 'VALIDATED', 'REJECTED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['PRODUCT', 'SERVICE'] })
  @ApiResponse({ status: 200, description: 'Liste des projets', type: [ProjectListItemResponseDTO] })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Tenant interdit' })
  async listProjects(
    @Headers() headers: any,
    @Query('status') status?: string,
    @Query('type') type?: string
  ): Promise<ProjectListItemResponseDTO[]> {
    const tenantId = this.getTenantId(headers);

    let projects = await this.queryRepo.findAllProjects(tenantId);

    // Filtres optionnels
    if (status) {
      projects = projects.filter((p) => p.status === status);
    }
    if (type) {
      projects = projects.filter((p) => p.type === type);
    }

    return projects.map((p) => ({
      projectId: p.projectId,
      name: p.name,
      type: p.type,
      status: p.status,
      currentVersion: p.currentVersion,
      createdAt: p.createdAt.toISOString(),
      validatedAt: p.validatedAt?.toISOString(),
      rejectedAt: p.rejectedAt?.toISOString(),
      rejectionReason: p.rejectionReason,
    }));
  }

  /**
   * Endpoint 2: Structure de coûts active
   * GET /api/cost-structure/projects/{projectId}/structure
   * Vue SQL: rm_cost_structure_current
   */
  @Get('/projects/:projectId/structure')
  @ApiOperation({
    summary: 'Structure de coûts active (FROZEN)',
    description: 'Retourne la dernière version FROZEN. Vue SQL: rm_cost_structure_current',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Structure trouvée', type: CostStructureResponseDTO })
  @ApiResponse({ status: 404, description: 'Aucune version FROZEN' })
  async getCostStructure(
    @Headers() headers: any,
    @Param('projectId') projectId: string
  ): Promise<CostStructureResponseDTO> {
    const tenantId = this.getTenantId(headers);

    const structure = await this.queryRepo.findCurrentCostStructure(tenantId, projectId);

    if (!structure) {
      throw new HttpException('No FROZEN cost structure found', HttpStatus.NOT_FOUND);
    }

    return {
      projectId: structure.projectId,
      version: structure.version,
      status: structure.status,
      createdAt: structure.createdAt.toISOString(),
      frozenAt: structure.frozenAt.toISOString(),
      frozenBy: structure.frozenBy,
    };
  }

  /**
   * Endpoint 3: Détail des lignes de coûts
   * GET /api/cost-structure/projects/{projectId}/structure/{version}/lines
   * Vue SQL: rm_cost_lines
   */
  @Get('/projects/:projectId/structure/:version/lines')
  @ApiOperation({
    summary: 'Lignes de coûts',
    description: 'Composition détaillée de la structure. Vue SQL: rm_cost_lines',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiResponse({ status: 200, description: 'Lignes de coûts', type: [CostLineItemResponseDTO] })
  async getCostLines(
    @Headers() headers: any,
    @Param('projectId') projectId: string,
    @Param('version') version: number
  ): Promise<CostLineItemResponseDTO[]> {
    const tenantId = this.getTenantId(headers);

    const lines = await this.queryRepo.findCostLines(tenantId, projectId, version);

    return lines.map((line) => ({
      category: line.category,
      label: line.label,
      amount: line.amount,
      currency: line.currency,
      allocationRule: line.allocationRule,
    }));
  }

  /**
   * Endpoint 4: Résultats de simulation
   * GET /api/cost-structure/projects/{projectId}/structure/{version}/simulation
   * Vue SQL: rm_cost_simulation_results
   */
  @Get('/projects/:projectId/structure/:version/simulation')
  @ApiOperation({
    summary: 'Résultats de simulation',
    description: 'Métriques calculées par Guardian. Vue SQL: rm_cost_simulation_results',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiParam({ name: 'version', description: 'Version number' })
  @ApiResponse({ status: 200, description: 'Résultats trouvés', type: SimulationResponseDTO })
  @ApiResponse({ status: 404, description: 'Simulation non effectuée' })
  async getSimulationResults(
    @Headers() headers: any,
    @Param('projectId') projectId: string,
    @Param('version') version: number
  ): Promise<SimulationResponseDTO> {
    const tenantId = this.getTenantId(headers);

    const results = await this.queryRepo.findSimulationResults(tenantId, projectId, version);

    if (!results) {
      throw new HttpException('Simulation not found', HttpStatus.NOT_FOUND);
    }

    return {
      unitCost: results.unitCost,
      totalCost: results.totalCost,
      grossMargin: results.grossMargin,
      netMargin: results.netMargin,
      marginAt70: results.marginAt70,
      viableAt70: results.viableAt70,
      simulatedAt: results.simulatedAt.toISOString(),
    };
  }

  /**
   * Endpoint 5: Décision finale (audit)
   * GET /api/cost-structure/projects/{projectId}/decision
   * Vue SQL: rm_cost_decisions
   */
  @Get('/projects/:projectId/decision')
  @ApiOperation({
    summary: 'Décision finale (audit)',
    description: 'Décision humaine finale. Vue SQL: rm_cost_decisions',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Décision trouvée', type: DecisionResponseDTO })
  @ApiResponse({ status: 404, description: 'Aucune décision' })
  async getDecision(
    @Headers() headers: any,
    @Param('projectId') projectId: string
  ): Promise<DecisionResponseDTO> {
    const tenantId = this.getTenantId(headers);

    const decisions = await this.queryRepo.findDecisions(tenantId, projectId);

    if (decisions.length === 0) {
      throw new HttpException('No decision found', HttpStatus.NOT_FOUND);
    }

    // Dernière décision
    const latest = decisions[0];

    return {
      decision: latest.decision,
      version: latest.version,
      decidedBy: latest.decidedBy,
      decidedAt: latest.decidedAt.toISOString(),
      justification: latest.justification,
    };
  }

  /**
   * Endpoint 6: Projets budgétables (CONTRAT BUDGET)
   * GET /api/cost-structure/budget-ready/projects
   * Vue SQL: rm_cost_projects_budget_ready
   */
  @Get('/budget-ready/projects')
  @ApiOperation({
    summary: '⚠️ Projets budgétables (CONTRAT BUDGET)',
    description:
      'Expose UNIQUEMENT les projets autorisés pour Budget (VALIDATED + FROZEN + viable_at_70). Vue SQL: rm_cost_projects_budget_ready',
  })
  @ApiResponse({
    status: 200,
    description: 'Projets budgétables',
    type: [BudgetReadyProjectItemResponseDTO],
  })
  async getBudgetReadyProjects(
    @Headers() headers: any
  ): Promise<BudgetReadyProjectItemResponseDTO[]> {
    const tenantId = this.getTenantId(headers);

    const projects = await this.queryRepo.findBudgetReadyProjects(tenantId);

    return projects.map((p) => ({
      projectId: p.projectId,
      name: p.name,
      type: p.type,
      version: p.version,
      unitCost: p.unitCost,
      totalCost: p.totalCost,
      netMargin: p.netMargin,
      marginAt70: p.marginAt70,
      viableAt70: p.viableAt70,
      validatedAt: p.validatedAt.toISOString(),
    }));
  }

  /**
   * Endpoint 7: Historique des versions
   * GET /api/cost-structure/projects/{projectId}/history
   * Vue SQL: jointure rm_cost_structure_current + rm_cost_decisions
   */
  @Get('/projects/:projectId/history')
  @ApiOperation({
    summary: 'Historique des versions',
    description: 'Historique décisionnel du projet. Vue SQL: jointure',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Historique trouvé', type: [ProjectHistoryItemResponseDTO] })
  async getProjectHistory(
    @Headers() headers: any,
    @Param('projectId') projectId: string
  ): Promise<ProjectHistoryItemResponseDTO[]> {
    const tenantId = this.getTenantId(headers);

    // Récupérer le projet pour obtenir toutes les versions
    const project = await this.queryRepo.findProjectById(tenantId, projectId);

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    // Récupérer les décisions
    const decisions = await this.queryRepo.findDecisions(tenantId, projectId);

    // Construire l'historique (simplifié - à enrichir avec versions réelles)
    const history: ProjectHistoryItemResponseDTO[] = decisions.map((d) => ({
      version: d.version,
      status: 'FROZEN' as const,
      decision: d.decision,
      decidedAt: d.decidedAt.toISOString(),
      decidedBy: d.decidedBy,
    }));

    return history.sort((a, b) => a.version - b.version);
  }
}
