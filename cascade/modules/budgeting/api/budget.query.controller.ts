/**
 * Budget Query Controller - GET endpoints only
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: CQRS strict, Guardian non impliqué
 */

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetQueryRepository } from '../infrastructure/budget.query.repository';
import { BudgetProjectionDTO } from './dto/budget-projection.dto';
import { BudgetExecutionDTO } from './dto/budget-execution.dto';
import { BudgetVarianceDTO } from './dto/budget-variance.dto';
import { BudgetCumulativeDTO } from './dto/budget-cumulative.dto';
import { BudgetAlertDTO } from './dto/budget-alert.dto';

@ApiTags('Budget Queries')
@ApiBearerAuth()
@Controller('/api/budgets')
export class BudgetQueryController {
  constructor(private readonly repo: BudgetQueryRepository) {}

  @Get('/projection')
  @ApiOperation({ summary: 'Get cashflow projections' })
  @ApiResponse({ status: 200, type: [BudgetProjectionDTO] })
  async projection(@Req() req: any): Promise<BudgetProjectionDTO[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    return this.repo.projection(tenantId);
  }

  @Get('/execution')
  @ApiOperation({ summary: 'Get actual cashflow execution' })
  @ApiResponse({ status: 200, type: [BudgetExecutionDTO] })
  async execution(@Req() req: any): Promise<BudgetExecutionDTO[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    return this.repo.execution(tenantId);
  }

  @Get('/variance')
  @ApiOperation({ summary: 'Get budget variance (projected vs actual)' })
  @ApiResponse({ status: 200, type: [BudgetVarianceDTO] })
  async variance(@Req() req: any): Promise<BudgetVarianceDTO[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    return this.repo.variance(tenantId);
  }

  @Get('/cumulative')
  @ApiOperation({ summary: 'Get cumulative cashflow projections' })
  @ApiResponse({ status: 200, type: [BudgetCumulativeDTO] })
  async cumulative(@Req() req: any): Promise<BudgetCumulativeDTO[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    return this.repo.cumulative(tenantId);
  }

  @Get('/alerts')
  @ApiOperation({ summary: 'Get liquidity alerts' })
  @ApiResponse({ status: 200, type: [BudgetAlertDTO] })
  async alerts(@Req() req: any): Promise<BudgetAlertDTO[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new Error('TENANT_ID_REQUIRED');
    }
    return this.repo.alerts(tenantId);
  }
}
