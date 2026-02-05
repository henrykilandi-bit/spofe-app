/**
 * Controller — Cost Projects
 * Version: v1.0.0
 * 
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers rm_economic_projects_summary
 * ✅ Multi-tenant explicite
 */

import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CostProjectDTO } from '../dto/cost-project.dto';

// Placeholder for the query repository
// In real implementation, import from infrastructure layer
interface CostStructureQueryRepository {
  findProjects(filters: {
    tenantId: string;
    status?: string;
    type?: string;
  }): Promise<CostProjectDTO[]>;
}

@ApiTags('Cost Projects')
@Controller('/api/cost-structure/projects')
export class CostProjectsController {
  constructor(
    private readonly queryRepo: CostStructureQueryRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List economic projects',
    description: 'Returns all projects for tenant with optional filters',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for multi-tenant isolation',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of projects',
    type: [CostProjectDTO],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async listProjects(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<CostProjectDTO[]> {
    return this.queryRepo.findProjects({
      tenantId,
      status,
      type,
    });
  }
}
