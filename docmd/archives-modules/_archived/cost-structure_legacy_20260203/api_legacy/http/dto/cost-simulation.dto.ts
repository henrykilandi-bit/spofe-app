/**
 * DTO — Cost Simulation
 * Version: v1.0.0
 * 
 * Mapping 1:1 vers rm_cost_simulations
 */

import { ApiProperty } from '@nestjs/swagger';

export class CostSimulationDTO {
  @ApiProperty({
    description: 'Simulation ID',
    example: 'sim-123',
  })
  simulationId!: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-1',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Project ID',
    example: 'project-123',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Version number',
    example: 2,
  })
  version!: number;

  @ApiProperty({
    description: 'Sales volume used for simulation',
    example: 1000,
  })
  salesVolume!: number;

  @ApiProperty({
    description: 'Unit cost at this volume',
    example: 10.5,
  })
  unitCost!: number;

  @ApiProperty({
    description: 'Total cost at this volume',
    example: 10500,
  })
  totalCost!: number;

  @ApiProperty({
    description: 'Net margin at this volume',
    example: 0.25,
  })
  netMargin!: number;

  @ApiProperty({
    description: 'Margin at 70% of sales volume',
    example: 0.08,
  })
  marginAt70!: number;

  @ApiProperty({
    description: 'Is viable at 70% (marginAt70 > 0)',
    example: true,
  })
  viableAt70!: boolean;

  @ApiProperty({
    description: 'Break-even point in units',
    example: 700,
  })
  breakEvenPoint!: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-01-15T10:30:00Z',
  })
  createdAt!: string;
}
