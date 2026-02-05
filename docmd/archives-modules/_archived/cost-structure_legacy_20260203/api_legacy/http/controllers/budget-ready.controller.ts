/**
 * Controller — Budget-Ready Projects
 * Version: v1.0.0
 * Contrat: COUT-BUD-01
 * 
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers rm_cost_projects_budget_ready
 * ✅ Multi-tenant explicite
 * ✅ Consommable par module Budget
 */

import { Controller, Get, Param, Headers, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { CostStructureQueryRepository } from '../../../infrastructure/cost-structure.query.repository.js';
import { BudgetReadyProjectDTO } from '../dto/budget-ready.dto.js';
import { CostStructureSummaryDTO } from '../dto/cost-structure-summary.dto.js';

@ApiTags('Cost-Structure — Budget Contract')
@Controller('/api/cost-structure/budget-ready')
export class BudgetReadyController {
  constructor(
    private readonly queryRepo: CostStructureQueryRepository,
  ) {}

  /**
   * GET /api/cost-structure/budget-ready/projects
   * 
   * Retourne tous les projets APPROVED prêts pour consommation Budget.
   * Contrat COUT-BUD-01: Seuls les projets validés avec marginAt70 > 0.
   */
  @Get('/projects')
  @ApiOperation({
    summary: 'List budget-ready projects',
    description: 'Returns all APPROVED projects ready for Budget consumption (COUT-BUD-01)',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for multi-tenant isolation',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of budget-ready projects',
    type: [BudgetReadyProjectDTO],
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid tenant ID',
  })
  async listBudgetReadyProjects(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<BudgetReadyProjectDTO[]> {
    if (!tenantId) {
      throw new NotFoundException('Tenant ID is required');
    }

    const projects = await this.queryRepo.findBudgetReadyProjects(tenantId);
    
    return projects.map(project => ({
      tenantId: project.tenantId,
      projectId: project.projectId,
      projectName: project.name,
      version: project.version,
      unitCost: project.unitCost,
      totalCost: project.totalCost,
      netMargin: project.netMargin,
      marginAt70: project.marginAt70,
    }));
  }

  /**
   * GET /api/cost-structure/budget-ready/projects/:projectId
   * 
   * Retourne un projet spécifique s'il est budget-ready.
   */
  @Get('/projects/:projectId')
  @ApiOperation({
    summary: 'Get budget-ready project by ID',
    description: 'Returns a specific APPROVED project for Budget consumption',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for multi-tenant isolation',
    required: true,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project identifier',
    example: 'project-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget-ready project',
    type: BudgetReadyProjectDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not budget-ready',
  })
  async getBudgetReadyProject(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
  ): Promise<BudgetReadyProjectDTO> {
    if (!tenantId) {
      throw new NotFoundException('Tenant ID is required');
    }

    const projects = await this.queryRepo.findBudgetReadyProjects(tenantId);
    const project = projects.find(p => p.projectId === projectId);

    if (!project) {
      throw new NotFoundException(
        `Project ${projectId} not found or not ready for Budget consumption`
      );
    }

    return {
      tenantId: project.tenantId,
      projectId: project.projectId,
      projectName: project.name,
      version: project.version,
      unitCost: project.unitCost,
      totalCost: project.totalCost,
      netMargin: project.netMargin,
      marginAt70: project.marginAt70,
    };
  }

  /**
   * GET /api/cost-structure/budget-ready/projects/:projectId/summary
   * 
   * Retourne le résumé des coûts pour intégration Budget.
   */
  @Get('/projects/:projectId/versions/:version/summary')
  @ApiOperation({
    summary: 'Get cost structure summary for Budget',
    description: 'Returns cost breakdown summary for Budget module consumption',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for multi-tenant isolation',
    required: true,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project identifier',
    example: 'project-123',
  })
  @ApiParam({
    name: 'version',
    description: 'Cost structure version',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cost structure summary',
    type: CostStructureSummaryDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getCostSummaryForBudget(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
    @Param('version') version: number,
  ): Promise<CostStructureSummaryDTO> {
    if (!tenantId) {
      throw new NotFoundException('Tenant ID is required');
    }

    const summary = await this.queryRepo.findCostStructureSummary(tenantId, projectId, version);

    if (!summary) {
      throw new NotFoundException(`Cost structure summary not found for project ${projectId} version ${version}`);
    }

    return {
      tenantId: summary.tenantId,
      projectId: summary.projectId,
      version: summary.version,
      costBreakdown: {
        variable: summary.totalVariableCost,
        fixed: summary.totalFixedCost,
        indirect: summary.totalIndirectCost,
        total: summary.totalCostSum,
      },
      costLinesCount: summary.costLinesCount,
      status: summary.status,
      frozenAt: summary.frozenAt?.toISOString() ?? null,
    };
  }
}
