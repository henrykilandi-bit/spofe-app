/**
 * Response DTO - Projets budgétables (CONTRAT BUDGET)
 * Endpoint: GET /api/cost-structure/budget-ready/projects
 * Vue SQL: rm_cost_projects_budget_ready
 */

import { ApiProperty } from '@nestjs/swagger';

export class BudgetReadyProjectItemResponseDTO {
  @ApiProperty({ description: 'Project ID', example: 'uuid-123' })
  projectId: string;

  @ApiProperty({ description: 'Project name', example: 'Service B' })
  name: string;

  @ApiProperty({ description: 'Project type', enum: ['PRODUCT', 'SERVICE'], example: 'SERVICE' })
  type: 'PRODUCT' | 'SERVICE';

  @ApiProperty({ description: 'Version number', example: 2 })
  version: number;

  @ApiProperty({ description: 'Unit cost', example: 15.4 })
  unitCost: number;

  @ApiProperty({ description: 'Total cost', example: 15400 })
  totalCost: number;

  @ApiProperty({ description: 'Net margin (ratio)', example: 0.22 })
  netMargin: number;

  @ApiProperty({ description: 'Margin at 70% capacity (ratio)', example: 0.08 })
  marginAt70: number;

  @ApiProperty({ description: 'Viable at 70%', example: true })
  viableAt70: boolean;

  @ApiProperty({ description: 'Validation date', example: '2026-01-10T12:00:00Z' })
  validatedAt: string;
}

export class BudgetReadyProjectsResponseDTO {
  @ApiProperty({ type: [BudgetReadyProjectItemResponseDTO] })
  projects: BudgetReadyProjectItemResponseDTO[];
}
