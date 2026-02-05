/**
 * Controller — Cost Structure & Details
 * Version: v1.0.0
 * 
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers vues SQL
 * ✅ Multi-tenant explicite
 */

import { Controller, Get, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import {
  CostStructureDTO,
  CostLineDTO,
  CostSimulationDTO,
} from '../dto';

// Placeholder for the query repository
interface CostStructureQueryRepository {
  getCurrentStructure(params: {
    tenantId: string;
    projectId: string;
  }): Promise<CostStructureDTO>;

  getCostLines(params: {
    tenantId: string;
    projectId: string;
    version: number;
  }): Promise<CostLineDTO[]>;

  getSimulation(params: {
    tenantId: string;
    projectId: string;
    version: number;
  }): Promise<CostSimulationDTO>;

  getDecision(params: {
    tenantId: string;
    projectId: string;
  }): Promise<unknown>;
}

@ApiTags('Cost Structure')
@Controller('/api/cost-structure/projects/:projectId')
export class CostStructureController {
  constructor(
    private readonly queryRepo: CostStructureQueryRepository,
  ) {}

  @Get('/structure')
  @ApiOperation({
    summary: 'Get current cost structure',
    description: 'Returns the current version of cost structure for a project',
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
    description: 'Current cost structure',
    type: CostStructureDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getCurrentStructure(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
  ): Promise<CostStructureDTO> {
    return this.queryRepo.getCurrentStructure({
      tenantId,
      projectId,
    });
  }

  @Get('/structure/:version/lines')
  @ApiOperation({
    summary: 'Get cost lines for version',
    description: 'Returns all cost lines for a specific version',
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
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'List of cost lines',
    type: [CostLineDTO],
  })
  async getCostLines(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
    @Param('version') version: number,
  ): Promise<CostLineDTO[]> {
    return this.queryRepo.getCostLines({
      tenantId,
      projectId,
      version,
    });
  }

  @Get('/structure/:version/simulation')
  @ApiOperation({
    summary: 'Get simulation results',
    description: 'Returns simulation results for a specific version',
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
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Simulation results',
    type: CostSimulationDTO,
  })
  async getSimulation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
    @Param('version') version: number,
  ): Promise<CostSimulationDTO> {
    return this.queryRepo.getSimulation({
      tenantId,
      projectId,
      version,
    });
  }

  @Get('/decision')
  @ApiOperation({
    summary: 'Get validation decision',
    description: 'Returns the validation decision for a project',
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
    description: 'Decision record',
  })
  async getDecision(
    @Headers('x-tenant-id') tenantId: string,
    @Param('projectId') projectId: string,
  ): Promise<unknown> {
    return this.queryRepo.getDecision({
      tenantId,
      projectId,
    });
  }
}
