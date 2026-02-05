/**
 * Cost-Structure API Controller
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Aucune logique métier, mapping DTO → Command → Guardian
 */

import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEconomicProjectDTO } from './dto/create-economic-project.dto';
import { CreateCostStructureDTO } from './dto/create-cost-structure.dto';
import { AddCostLineDTO } from './dto/add-cost-line.dto';
import { UpdateAssumptionsDTO } from './dto/update-assumptions.dto';
import { RunSimulationDTO } from './dto/run-simulation.dto';
import { FreezeCostStructureDTO } from './dto/freeze-cost-structure.dto';
import { ValidateProjectDTO } from './dto/validate-project.dto';
import { RejectProjectDTO } from './dto/reject-project.dto';

import { CostStructureGuardian, CostStructureContext } from '../guardian/cost-structure.invariants';
import { CostStructureRepository } from '../infrastructure/cost-structure.repository';
import { EconomicProject } from '../domain/economic-project.aggregate';
import {
  CreateEconomicProjectCommand,
  CreateCostStructureCommand,
  AddCostLineCommand,
  UpdateAssumptionsCommand,
  RunSimulationCommand,
  FreezeCostStructureCommand,
  ValidateProjectCommand,
  RejectProjectCommand,
} from '../domain/commands';
import { Money, Quantity, EconomicScenarios, EconomicAssumptions, CostLine, SimulationMetrics } from '../domain/value-objects';

@ApiTags('Cost Structure')
@ApiBearerAuth()
@Controller('/api/cost-structure')
export class CostStructureController {
  private readonly guardian = new CostStructureGuardian();

  constructor(private readonly repository: CostStructureRepository) {}

  @Post('/projects')
  @ApiOperation({ summary: 'Create economic project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async createProject(@Body() dto: CreateEconomicProjectDTO) {
    const projectId = `proj-${Date.now()}`;
    const actorId = 'user-123'; // TODO: Extract from JWT

    const command: CreateEconomicProjectCommand = {
      type: 'CreateEconomicProject',
      tenantId: dto.tenantId,
      projectId,
      name: dto.name,
      projectType: dto.type,
      actorId,
    };

    // Guardian validation
    const existingProjects = await this.repository.findByTenant(dto.tenantId);
    const context: CostStructureContext = { existingProjects };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const { aggregate, events } = EconomicProject.create(
      projectId,
      dto.tenantId,
      dto.name,
      dto.type,
      actorId
    );

    await this.repository.save(aggregate);

    return { projectId, events };
  }

  @Post('/projects/:projectId/versions')
  @ApiOperation({ summary: 'Create cost structure version' })
  @ApiResponse({ status: 201, description: 'Version created' })
  async createCostStructure(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCostStructureDTO
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const command: CreateCostStructureCommand = {
      type: 'CreateCostStructure',
      tenantId: project.tenantId,
      projectId,
      version: project.versions.length + 1,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.createCostStructure(actorId);
    await this.repository.save(project);

    return { version: project.versions.length, events };
  }

  @Post('/projects/:projectId/versions/:version/cost-lines')
  @ApiOperation({ summary: 'Add cost line' })
  @ApiResponse({ status: 201, description: 'Cost line added' })
  async addCostLine(
    @Param('projectId') projectId: string,
    @Param('version') version: number,
    @Body() dto: AddCostLineDTO
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const costLine = new CostLine(
      dto.category,
      dto.label,
      new Money(dto.amount),
      dto.allocationRule
    );

    const command: AddCostLineCommand = {
      type: 'AddCostLine',
      tenantId: project.tenantId,
      projectId,
      version,
      costLine,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.addCostLine(
      version,
      dto.category,
      dto.label,
      new Money(dto.amount),
      dto.allocationRule,
      actorId
    );
    await this.repository.save(project);

    return { events };
  }

  @Post('/projects/:projectId/versions/:version/assumptions')
  @ApiOperation({ summary: 'Update economic assumptions' })
  @ApiResponse({ status: 200, description: 'Assumptions updated' })
  async updateAssumptions(
    @Param('projectId') projectId: string,
    @Param('version') version: number,
    @Body() dto: UpdateAssumptionsDTO
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const assumptions = new EconomicAssumptions(
      new Money(dto.priceTarget),
      new Quantity(dto.expectedVolume),
      new Quantity(dto.capacityMax),
      new EconomicScenarios(
        dto.scenarios.pessimistic,
        dto.scenarios.realistic,
        dto.scenarios.optimistic
      )
    );

    const command: UpdateAssumptionsCommand = {
      type: 'UpdateAssumptions',
      tenantId: project.tenantId,
      projectId,
      version,
      assumptions,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.updateAssumptions(version, assumptions, actorId);
    await this.repository.save(project);

    return { events };
  }

  @Post('/projects/:projectId/versions/:version/simulate')
  @ApiOperation({ summary: 'Run cost simulation' })
  @ApiResponse({ status: 200, description: 'Simulation completed' })
  async runSimulation(
    @Param('projectId') projectId: string,
    @Param('version') version: number
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const command: RunSimulationCommand = {
      type: 'RunSimulation',
      tenantId: project.tenantId,
      projectId,
      version,
      actorId,
    };

    // Guardian validation + computation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Extract metrics from Guardian
    const metricsData = verdict.metadata?.simulationMetrics;
    const metrics = new SimulationMetrics(
      new Money(metricsData.unitCost),
      new Money(metricsData.totalCost),
      metricsData.grossMargin,
      metricsData.netMargin,
      metricsData.marginAt70,
      metricsData.viableAt70
    );

    // Execute
    const events = project.runSimulation(version, metrics, actorId);
    await this.repository.save(project);

    return { metrics: metricsData, events };
  }

  @Post('/projects/:projectId/versions/:version/freeze')
  @ApiOperation({ summary: 'Freeze cost structure version' })
  @ApiResponse({ status: 200, description: 'Version frozen' })
  async freezeCostStructure(
    @Param('projectId') projectId: string,
    @Param('version') version: number
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const command: FreezeCostStructureCommand = {
      type: 'FreezeCostStructure',
      tenantId: project.tenantId,
      projectId,
      version,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.freezeCostStructure(version, actorId);
    await this.repository.save(project);

    return { events };
  }

  @Post('/projects/:projectId/validate')
  @ApiOperation({ summary: 'Validate project (final approval)' })
  @ApiResponse({ status: 200, description: 'Project validated' })
  async validateProject(@Param('projectId') projectId: string) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const command: ValidateProjectCommand = {
      type: 'ValidateProject',
      tenantId: project.tenantId,
      projectId,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.validate(actorId);
    await this.repository.save(project);

    return { events };
  }

  @Post('/projects/:projectId/reject')
  @ApiOperation({ summary: 'Reject project' })
  @ApiResponse({ status: 200, description: 'Project rejected' })
  async rejectProject(
    @Param('projectId') projectId: string,
    @Body() dto: RejectProjectDTO
  ) {
    const actorId = 'user-123'; // TODO: Extract from JWT

    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const command: RejectProjectCommand = {
      type: 'RejectProject',
      tenantId: project.tenantId,
      projectId,
      reason: dto.reason,
      actorId,
    };

    // Guardian validation
    const context: CostStructureContext = { projectDetails: this.buildProjectContext(project) };
    const verdict = this.guardian.validate(command, context);

    if (!verdict.ok) {
      throw new Error(`Guardian rejection: ${verdict.violationCode} - ${verdict.message}`);
    }

    // Execute
    const events = project.reject(dto.reason, actorId);
    await this.repository.save(project);

    return { events };
  }

  @Get('/projects/:projectId')
  @ApiOperation({ summary: 'Get project details' })
  @ApiResponse({ status: 200, description: 'Project found' })
  async getProject(@Param('projectId') projectId: string) {
    const project = await this.repository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return {
      projectId: project.projectId,
      tenantId: project.tenantId,
      name: project.name,
      type: project.type,
      status: project.status,
      versions: project.versions.map((v) => ({
        version: v.version,
        status: v.status,
        costLinesCount: v.costLines.length,
        hasAssumptions: !!v.assumptions,
        hasSimulation: !!v.simulationMetrics,
        marginAt70: v.simulationMetrics?.marginAt70,
        viableAt70: v.simulationMetrics?.viableAt70,
      })),
    };
  }

  /**
   * Helper: Build project context for Guardian
   */
  private buildProjectContext(project: EconomicProject): any {
    return {
      projectId: project.projectId,
      tenantId: project.tenantId,
      status: project.status,
      versions: project.versions.map((v) => ({
        version: v.version,
        status: v.status,
        costLines: v.costLines,
        assumptions: v.assumptions,
        simulationMetrics: v.simulationMetrics,
      })),
    };
  }
}
